(() => {
  'use strict';

  const formats = {
    disk: {name:'Floppy disk', deck:'Drive A', play:'Insert disk', cue:'Slide the disk into the drive.', busy:'Reading…', motion:'slide'},
    cd: {name:'CD', deck:'CD player', play:'Load CD', cue:'Slide the disc into the player.', busy:'Spinning up…', motion:'slide'},
    reel: {name:'Reel-to-reel', deck:'Reel-to-reel deck', play:'Roll tape', cue:'Tap the reels to start the tape.', busy:'Rolling…', motion:'reels'},
    vhs: {name:'VHS', deck:'Video deck', play:'Insert VHS', cue:'Slide the cassette into the deck.', busy:'Tracking…', motion:'slide'},
    gramophone: {name:'Gramophone', deck:'Gramophone', play:'Lower the needle', cue:'Tap the gramophone to start the record.', busy:'Lowering needle…', motion:'needle'},
    vinyl: {name:'Vinyl', deck:'Turntable', play:'Drop the needle', cue:'Tap the record to give it a spin.', busy:'Spinning up…', motion:'spin'},
    tape: {name:'Cassette tape', deck:'Cassette deck', play:'Load cassette', cue:'Slide the tape into the deck.', busy:'Winding…', motion:'slide'},
    pianola: {name:'Pianola', deck:'Player piano', play:'Feed the roll', cue:'Slide the paper roll into the player.', busy:'Unrolling…', motion:'feed'}
  };

  function part(parent, name) {
    const layer = document.createElement('span');
    layer.className = name;
    parent.append(layer);
    return layer;
  }

  function render(host, card) {
    const theme = CardEdition.editions[card.theme];
    const format = card.format;
    const shell = document.createElement('span');
    shell.className = 'carrier carrier-' + format;
    shell.setAttribute('aria-hidden','true');
    const face = part(shell, 'carrier-face');
    if (format === 'disk') {
      const img = document.createElement('img');
      img.src = theme.path + 'assets/' + theme.disk;
      img.alt = ''; img.draggable = false;
      face.append(img);
    }
    if (['vhs','tape','reel'].includes(format)) {
      part(face,'spool spool-left');
      part(face,'spool spool-right');
    }
    if (format === 'gramophone') {
      part(face,'gram-cabinet'); part(face,'gram-platter'); part(face,'gram-neck'); part(face,'gram-horn');
    }
    if (format === 'pianola') {
      const paper = part(face,'piano-paper');
      // A short perforation pattern across the tracker bar.
      [1,4,8,5,3,7,8,4,2,6,4,7,3,1,5,8,3,5,2,6].forEach((note,i) => {
        const hole = part(paper,'perforation');
        hole.style.left = (5 + i * 4.6) + '%';
        hole.style.top = (5 + note * 8) + '%';
        hole.style.height = (9 + i % 3 * 5) + '%';
      });
      part(face,'piano-roller upper'); part(face,'piano-roller lower'); part(face,'piano-keys');
    }
    const label = part(face, 'carrier-label');
    if (CardEdition.includesArt(card,'label')) {
      CardEdition.displayArt(label,card.art);
      label.classList.add('has-art');
    } else if (format !== 'disk') {
      label.textContent = card.video ? 'Side A' : theme.track.split(' · ')[0];
    } else label.hidden = true;
    if (format === 'vinyl' || format === 'cd') part(face,'spindle');
    host.replaceChildren(shell);
  }

  window.CardFormats = Object.freeze({formats,render});
})();
