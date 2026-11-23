import AVFoundation

/// ReplayKit delivers PCM. Read each channel independently, including noninterleaved buffers.
enum PCMLevel {
    static func decibels(_ sample: CMSampleBuffer) throws -> Double {
        guard let description = CMSampleBufferGetFormatDescription(sample),
              let format = CMAudioFormatDescriptionGetStreamBasicDescription(description)?.pointee,
              format.mFormatID == kAudioFormatLinearPCM else {
            throw KeptError.message("Capture supplied an unsupported audio format.")
        }
        var size = 0
        let sizing = CMSampleBufferGetAudioBufferListWithRetainedBlockBuffer(
            sample, bufferListSizeNeededOut: &size, bufferListOut: nil,
            bufferListSize: 0, blockBufferAllocator: nil, blockBufferMemoryAllocator: nil,
            flags: 0, blockBufferOut: nil)
        guard size > 0 else { throw KeptError.message("No PCM buffer available (\(sizing)).") }
        let memory = UnsafeMutableRawPointer.allocate(byteCount: size, alignment: 16)
        defer { memory.deallocate() }
        let list = memory.bindMemory(to: AudioBufferList.self, capacity: 1)
        var retained: CMBlockBuffer?
        let status = CMSampleBufferGetAudioBufferListWithRetainedBlockBuffer(
            sample, bufferListSizeNeededOut: nil, bufferListOut: list, bufferListSize: size,
            blockBufferAllocator: nil, blockBufferMemoryAllocator: nil,
            flags: UInt32(kCMSampleBufferFlag_AudioBufferList_Assure16ByteAlignment), blockBufferOut: &retained)
        guard status == noErr else { throw KeptError.message("Audio meter failed (\(status)).") }
        let floating = format.mFormatFlags & kAudioFormatFlagIsFloat != 0
        let signed = format.mFormatFlags & kAudioFormatFlagIsSignedInteger != 0
        guard format.mFormatFlags & kAudioFormatFlagIsBigEndian == 0 else {
            throw KeptError.message("Big-endian audio is unsupported.")
        }
        var peakRMS: Double = 0
        for buffer in UnsafeMutableAudioBufferListPointer(list) {
            guard let data = buffer.mData else { continue }
            let bytes = Int(buffer.mDataByteSize)
            var sum: Double = 0
            let width = Int(format.mBitsPerChannel / 8)
            guard width > 0 else { throw KeptError.message("Invalid PCM sample width.") }
            let count = bytes / width
            guard count > 0 else { continue }
            for index in 0..<count {
                let value: Double
                if floating && width == 4 {
                    value = Double(data.load(fromByteOffset: index * width, as: Float.self))
                } else if floating && width == 8 {
                    value = data.load(fromByteOffset: index * width, as: Double.self)
                } else if signed && width == 2 {
                    value = Double(data.load(fromByteOffset: index * width, as: Int16.self)) / 32768
                } else if signed && width == 4 {
                    value = Double(data.load(fromByteOffset: index * width, as: Int32.self)) / 2147483648
                } else {
                    throw KeptError.message("Unsupported PCM sample width.")
                }
                guard value.isFinite else { throw KeptError.message("Invalid PCM sample value.") }
                sum += value * value
            }
            peakRMS = max(peakRMS, sqrt(sum / Double(count)))
        }
        return 20 * log10(max(peakRMS, 0.0000000001))
    }
}
