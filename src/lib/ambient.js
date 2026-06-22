import * as Tone from 'tone'

// Música ambiental generada en el navegador (sin archivos con derechos de autor):
// un pad cálido con acordes suaves que se mueven lentamente, más un brillo lejano.

let started = false
let reverb, pad, shimmer, loop, master

const CHORDS = [
  ['C3', 'E3', 'G3', 'B3'],
  ['A2', 'C3', 'E3', 'G3'],
  ['F2', 'A2', 'C3', 'E3'],
  ['G2', 'B2', 'D3', 'F3'],
]

export async function startAmbient(volume = -14) {
  if (started) return
  await Tone.start()

  master = new Tone.Volume(volume).toDestination()
  reverb = new Tone.Reverb({ decay: 8, wet: 0.55 }).connect(master)

  pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsine', count: 3, spread: 30 },
    envelope: { attack: 3, decay: 2, sustain: 0.8, release: 6 },
  }).connect(reverb)
  pad.volume.value = -8

  shimmer = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 4, decay: 3, sustain: 0.3, release: 8 },
  }).connect(reverb)
  shimmer.volume.value = -22

  let i = 0
  loop = new Tone.Loop((time) => {
    const chord = CHORDS[i % CHORDS.length]
    pad.triggerAttackRelease(chord, '8n', time)
    shimmer.triggerAttackRelease(
      chord.map((n) => Tone.Frequency(n).transpose(12).toNote()),
      '4n',
      time + 1.5,
    )
    i++
  }, '4m').start(0)

  Tone.Transport.bpm.value = 60
  Tone.Transport.start()
  started = true
}

export function setAmbientVolume(db) {
  if (master) master.volume.rampTo(db, 0.5)
}

export function stopAmbient() {
  if (!started) return
  Tone.Transport.stop()
  loop?.dispose()
  pad?.dispose()
  shimmer?.dispose()
  reverb?.dispose()
  master?.dispose()
  started = false
}
