#!/usr/bin/env python3
"""Reproducible local treatment of the supplied CLUB 2263 audio recording."""
from pathlib import Path
import hashlib, json, re, subprocess
import numpy as np
from scipy import signal
from scipy.io import wavfile

import argparse
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path, help='Original supplied M4A recording')
parser.add_argument('--work-dir', type=Path, default=Path.cwd()/'audio-work')
parser.add_argument('--output-dir', type=Path, default=Path(__file__).resolve().parents[1]/'audio')
args = parser.parse_args()
SOURCE = args.source.resolve()
WORK = args.work_dir.resolve()
PUBLIC = args.output_dir.resolve()
WORK.mkdir(parents=True, exist_ok=True)
SR = 48000
PUBLIC.mkdir(parents=True, exist_ok=True)

def run(args):
    return subprocess.run(args, check=True, capture_output=True)

def decode(path):
    raw = run(['ffmpeg','-v','error','-i',str(path),'-f','f32le','-ac','2','-ar',str(SR),'pipe:1']).stdout
    return np.frombuffer(raw, '<f4').reshape(-1,2).astype(np.float64)

def measure(path):
    raw = run(['ffmpeg','-hide_banner','-nostats','-i',str(path),'-af','loudnorm=I=-18:TP=-1.5:LRA=11:print_format=json','-f','null','-']).stderr.decode()
    return json.loads(re.findall(r'\{\s*"input_i".*?\}', raw, re.S)[-1])

def periodic_filter(sos, audio):
    repeated = np.tile(audio, (3,1))
    filtered = signal.sosfilt(sos, repeated, axis=0)
    return filtered[len(audio):2*len(audio)]

def peak_filter(freq, gain, q=.7):
    a=10**(gain/40); w=2*np.pi*freq/SR; alpha=np.sin(w)/(2*q); c=np.cos(w)
    b=np.array([1+alpha*a,-2*c,1-alpha*a])
    den=np.array([1+alpha/a,-2*c,1-alpha/a])
    return signal.tf2sos(b/den[0], den/den[0])

source_hash=hashlib.sha256(SOURCE.read_bytes()).hexdigest()
x=decode(SOURCE)

# Find the actual repeated waveform rather than force a guessed tempo/grid.
y=signal.resample_poly(x.mean(axis=1),1,8)
ds=SR//8
reference=y[:12*ds]
search=y[14*ds:30*ds]
corr=signal.correlate(search,reference,mode='valid',method='fft')
energy=np.r_[0,np.cumsum(search**2)]
norm=np.sqrt((energy[len(reference):]-energy[:-len(reference)])*np.sum(reference**2))
ncc=corr/(norm+1e-12)
best=int(np.argmax(ncc))
period=14*SR+best*8
assert ncc[best]>.8, 'The repeated phrase is no longer trustworthy.'

# A short raised-cosine blend uses the next recorded repeat at the boundary.
# The beginning thus continues naturally from the loop's final sample.
fade=int(.120*SR)
phase=np.linspace(0,1,fade)
weight=.5-.5*np.cos(np.pi*phase)
loop=x[:period].copy()
loop[:fade]=(1-weight[:,None])*x[period:period+fade]+weight[:,None]*loop[:fade]

# Slightly slower and lower, together: preserves phrasing and recognisable anchor.
loop=signal.resample(loop, round(len(loop)/.97), axis=0)
loop=periodic_filter(signal.butter(2,38,'highpass',fs=SR,output='sos'),loop)
loop=periodic_filter(peak_filter(165,1.6,.7),loop)
loop=periodic_filter(peak_filter(3400,-1.4,.8),loop)
loop=periodic_filter(signal.butter(2,10500,'lowpass',fs=SR,output='sos'),loop)

# Low-level soft saturation, mostly dry, to round sharp decoded peaks.
loop=.78*loop+.22*(np.tanh(1.35*loop)/1.35)

# Circular stereo reflections retain tails across the repeat without extra silence.
reflections=np.zeros_like(loop)
for ms_l,ms_r,amount in [(113,157,.040),(331,383,.073),(571,637,.035),(809,863,.018)]:
    reflections[:,0]+=amount*np.roll(loop[:,1],round(ms_l*SR/1000))
    reflections[:,1]+=amount*np.roll(loop[:,0],round(ms_r*SR/1000))
reflections=periodic_filter(signal.butter(2,4500,'lowpass',fs=SR,output='sos'),reflections)
loop+=reflections
raw=WORK/'vip-afterhours-pre-master.wav'
wavfile.write(raw,SR,loop.astype(np.float32))

# Two-pass linear loudness normalisation: quiet background master, no loudness push.
first=measure(raw)
settings=':'.join([
    'loudnorm=I=-18:TP=-1.5:LRA=11',
    'measured_I='+first['input_i'],
    'measured_TP='+first['input_tp'],
    'measured_LRA='+first['input_lra'],
    'measured_thresh='+first['input_thresh'],
    'offset='+first['target_offset'],
    'linear=true:print_format=summary'])
master=WORK/'CLUB_2263_Afterhours_Loop_Master.wav'
run(['ffmpeg','-v','error','-y','-i',str(raw),'-af',settings,'-ar',str(SR),'-c:a','pcm_s24le',str(master)])
mp3=PUBLIC/'vip-afterhours-loop.mp3'
run(['ffmpeg','-v','error','-y','-i',str(master),'-map_metadata','-1','-c:a','libmp3lame','-b:a','160k','-ar',str(SR),'-id3v2_version','3','-metadata','title=CLUB 2263 — Afterhours loop','-metadata','comment=Derived from user-supplied recording; warm slowed loop',str(mp3)])
master_stats=measure(master)
mp3_stats=measure(mp3)
assert float(mp3_stats['input_tp'])<=-1.0,'Lossy true-peak limit exceeded.'
decoded=decode(mp3)
master_audio=decode(master)
assert len(decoded)>0 and np.isfinite(decoded).all()
assert SOURCE.exists() and hashlib.sha256(SOURCE.read_bytes()).hexdigest()==source_hash
report={
 'source':{'filename':SOURCE.name,'sha256':source_hash,'bytes':SOURCE.stat().st_size,'duration_s':len(x)/SR,'sample_rate':SR,'channels':2,'loudness':measure(SOURCE)},
 'measured_repeat':{'period_s':period/SR,'waveform_correlation':float(ncc[best]),'method':'Normalised cross-correlation of the first 12 s against offsets 14–18 s at 6 kHz; detected source repetition, not a claimed BPM'},
 'treatment':{'speed':.97,'approx_pitch_shift_semitones':float(12*np.log2(.97)),'boundary_crossfade_ms':120,'highpass_hz':38,'warmth_db_at_165hz':1.6,'presence_db_at_3400hz':-1.4,'lowpass_hz':10500,'saturation_wet_fraction':.22,'stereo_reflections_ms':[[113,157],[331,383],[571,637],[809,863]],'target_lufs':-18},
 'master':{'filename':master.name,'duration_s':len(master_audio)/SR,'bytes':master.stat().st_size,'loudness':master_stats,'seam_jump_peak':float(np.max(np.abs(master_audio[0]-master_audio[-1])))},
 'web':{'filename':'audio/'+mp3.name,'duration_s':len(decoded)/SR,'bytes':mp3.stat().st_size,'bitrate_kbps':160,'loudness':mp3_stats,'stereo_correlation':float(np.corrcoef(decoded.T)[0,1])},
 'validation':{'decode':'pass','finite_samples':'pass','source_unchanged':'pass','lossy_true_peak_at_or_below_minus_1_dbtp':'pass','audition':'No direct listening interface was available; signal measurements and decode checks only. Seam timing and aesthetic quality were not assessed by ear.'}
}
(WORK/'audio-provenance.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
