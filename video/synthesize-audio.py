"""Original Openform sound bed. No samples or copyrighted recordings. MIT."""
import math, wave, struct, random
from pathlib import Path
random.seed(7)
SR=48000; D=30
samples=[0.0]*(SR*D)
def tone(start,duration,freq,amp=.1,attack=.02,decay=1.5):
 for j in range(int(duration*SR)):
  idx=int(start*SR)+j
  if idx>=len(samples):break
  t=j/SR; env=min(1,t/attack)*math.exp(-t/decay)*min(1,(duration-t)/.1)
  s=(math.sin(2*math.pi*freq*t)+.23*math.sin(2*math.pi*freq*2*t)+.07*math.sin(2*math.pi*freq*3*t))
  samples[idx]+=amp*env*s
# C major, slow alternating spacious voicings, arranged into the six product beats.
chords=[(0.2,[130.81,196,261.63]),(4,[110,164.81,220]),(8,[130.81,196,261.63]),(12,[146.83,196,293.66]),(16,[110,164.81,220]),(19,[130.81,196,329.63]),(22,[146.83,196,293.66]),(27,[130.81,196,261.63])]
for start,notes in chords:
 for i,n in enumerate(notes):tone(start+i*.075,3.7,n,.036,.45,5)
for s,n in [(1.6,523.25),(3,659.25),(4.1,783.99),(5.4,659.25),(7,523.25),(8.1,523.25),(9.3,659.25),(10.6,783.99),(12.2,587.33),(13.5,659.25),(14.1,523.25),(16.1,440),(17.2,659.25),(19.1,523.25),(20.1,659.25),(21.4,783.99),(22.8,587.33),(27,523.25),(27.45,659.25),(28.1,783.99)]:tone(s,1.5,n,.065,.008,.38)
# Small dry tactile transitions, not notification tones.
for start in [4,8,14,19,24,26.8]:
 for j in range(2400):
  idx=int(start*SR)+j
  t=j/SR; samples[idx]+=(random.random()*2-1)*.035*math.exp(-t*100)
for i in range(len(samples)):
 t=i/SR
 fade=min(1,t/1.2)*min(1,(D-t)/1.5)
 # A stripped pause at the ownership reveal.
 duck=.3 if 24<=t<26.8 else 1
 samples[i]=math.tanh(samples[i]*fade*duck)*.8*(10**(10/20))
with wave.open(str(Path(__file__).resolve().parent / 'public' / 'soundtrack.wav'),'w') as w:
 w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR)
 w.writeframes(b''.join(struct.pack('<hh',int(max(-1,min(1,s)) * 32767),int(max(-1,min(1,s)) * 32767)) for s in samples))
print('Original soundtrack: 30s, 48kHz stereo')
