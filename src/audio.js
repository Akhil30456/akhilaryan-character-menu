// All notes are synthesized at runtime. No third-party recordings or game themes.
const patterns = {
  home:       { bpm: 114, root: 45, scale: 'minor', motif: [0,null,7,10,7,null,3,5,0,null,7,12,10,7,5,null], bass: [0,0,5,3], wave: 'square' },
  about:      { bpm: 94, root: 48, scale: 'minor', motif: [0,null,3,7,null,5,3,null,0,null,7,5,null,3,0,null], bass: [0,5,3,0], wave: 'triangle' },
  projects:   { bpm: 132, root: 43, scale: 'minor', motif: [0,7,10,12,null,10,7,null,5,7,10,14,12,10,7,5], bass: [0,0,3,5], wave: 'square' },
  skills:     { bpm: 122, root: 50, scale: 'minor', motif: [0,null,7,null,10,7,5,null,0,3,7,null,12,10,7,null], bass: [0,5,3,7], wave: 'square' },
  experience: { bpm: 87, root: 45, scale: 'minor', motif: [0,null,null,3,7,null,5,null,3,null,0,5,7,null,10,null], bass: [0,3,5,0], wave: 'triangle' },
  contact:    { bpm: 89, root: 48, scale: 'major', motif: [0,null,4,null,7,null,9,null,7,null,4,null,2,null,0,null], bass: [0,5,3,0], wave: 'triangle' },
  'plus-one': { bpm: 102, root: 48, scale: 'major', motif: [0,null,7,9,4,null,7,12,9,7,4,null,2,4,7,null], bass: [0,5,3,0], wave: 'triangle' },
  'academic-0':  { bpm: 96, root: 48, scale: 'major', motif: [0,null,null,4,null,null,7,null,0,null,4,null,7,null,12,null], bass: [0,5,0,5], wave: 'triangle' },
  'academic-1':  { bpm: 145, root: 45, scale: 'minor', motif: [0,7,10,7,3,5,7,10,12,10,7,5,3,0,7,10], bass: [0,3,5,7], wave: 'square' },
  'academic-2':  { bpm: 83, root: 43, scale: 'minor', motif: [0,null,3,null,null,7,null,null,5,null,3,null,0,null,null,null], bass: [0,5,3,0], wave: 'triangle' },
  'academic-3':  { bpm: 110, root: 47, scale: 'minor', motif: [0,null,7,3,0,null,7,10,12,null,7,5,3,null,0,null], bass: [0,0,5,3], wave: 'square' },
  'academic-4':  { bpm: 117, root: 45, scale: 'minor', motif: [0,7,null,10,3,null,12,7,5,10,null,3,0,null,7,12], bass: [0,5,3,0], wave: 'square' },
  'academic-5':  { bpm: 72, root: 45, scale: 'minor', motif: [0,null,null,null,3,null,null,null,5,null,null,3,0,null,null,null], bass: [0,0,5,3], wave: 'triangle' },
  'academic-6':  { bpm: 136, root: 48, scale: 'major', motif: [0,4,7,9,12,9,7,4,0,4,7,12,14,12,9,7], bass: [0,5,3,7], wave: 'square' },
  'academic-7':  { bpm: 125, root: 50, scale: 'major', motif: [0,null,4,7,9,null,12,7,4,7,9,12,14,12,9,null], bass: [0,5,3,0], wave: 'square' },
  'academic-8':  { bpm: 89, root: 48, scale: 'minor', motif: [0,null,3,null,7,null,3,null,5,null,7,null,10,null,7,null], bass: [0,3,5,3], wave: 'triangle' },
  'academic-9':  { bpm: 112, root: 45, scale: 'minor', motif: [0,null,7,10,5,null,3,7,0,null,12,10,7,null,5,3], bass: [0,5,3,0], wave: 'square' },
  'academic-10': { bpm: 67, root: 43, scale: 'minor', motif: [0,null,null,null,null,3,null,null,5,null,null,null,3,null,null,null], bass: [0,3,5,0], wave: 'triangle' },
  'academic-11': { bpm: 98, root: 48, scale: 'minor', motif: [0,null,3,7,null,5,3,null,0,null,7,10,7,5,3,null], bass: [0,5,3,0], wave: 'triangle' },
};

let context;
let master;
let noiseBuffer;
let timer;
let bus;
let active = false;
let trackKey = 'home';
let step = 0;
let nextTime = 0;
let volume = .55;

function getContext(){
  if (context) return context;
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return null;
  context = new Audio();
  master = context.createGain();
  master.gain.value = volume * .18;
  master.connect(context.destination);
  const length = Math.round(context.sampleRate * .05);
  noiseBuffer = context.createBuffer(1, length, context.sampleRate);
  const channel = noiseBuffer.getChannelData(0);
  for (let i=0;i<length;i++) channel[i]=(Math.random()*2-1)*(1-i/length);
  return context;
}
function pitch(n){return 440*Math.pow(2,(n-69)/12)}
function tone(midi, at, length, type='square', level=.11, output=bus){
  if (!context || !output) return;
  const oscillator=context.createOscillator();
  const gain=context.createGain();
  const filter=context.createBiquadFilter();
  filter.type='lowpass'; filter.frequency.value=type==='square'?1750:2600;
  oscillator.type=type;
  oscillator.frequency.setValueAtTime(pitch(midi),at);
  gain.gain.setValueAtTime(.0001,at);
  gain.gain.linearRampToValueAtTime(level,at+.009);
  gain.gain.exponentialRampToValueAtTime(.0001,at+length);
  oscillator.connect(filter); filter.connect(gain); gain.connect(output);
  oscillator.start(at); oscillator.stop(at+length+.03);
  oscillator.onended=()=>{oscillator.disconnect();filter.disconnect();gain.disconnect()};
}
function tap(at, level=.055, output=bus){
  if(!context||!output)return;
  const source=context.createBufferSource(),gain=context.createGain(),filter=context.createBiquadFilter();
  source.buffer=noiseBuffer; filter.type='highpass';filter.frequency.value=1100;
  gain.gain.setValueAtTime(level,at);gain.gain.exponentialRampToValueAtTime(.0001,at+.048);
  source.connect(filter);filter.connect(gain);gain.connect(output);
  source.start(at);source.stop(at+.05);
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect()};
}
function newBus(){
  if(!context)return;
  const old=bus;
  bus=context.createGain();bus.gain.setValueAtTime(0,context.currentTime);
  bus.gain.linearRampToValueAtTime(.9,context.currentTime+.19);
  bus.connect(master);
  if(old){old.gain.cancelScheduledValues(context.currentTime);old.gain.setValueAtTime(old.gain.value,context.currentTime);old.gain.linearRampToValueAtTime(0,context.currentTime+.19);setTimeout(()=>old.disconnect(),450)}
  step=0;nextTime=context.currentTime+.04;
}
function schedule(){
  if(!active||!context||!bus)return;
  const track=patterns[trackKey]||patterns.home;
  const duration=60/track.bpm/4;
  while(nextTime<context.currentTime+.14){
    const pos=step%16;
    const note=track.motif[pos];
    if(note!==null)tone(track.root+12+note,nextTime,duration*1.7,track.wave,track.wave==='square'?.065:.09);
    if(pos%4===0){tone(track.root-12+track.bass[Math.floor(pos/4)],nextTime,duration*3.2,'sine',.21);tap(nextTime,trackKey==='academic-10'?.014:.035)}
    if(pos%4===2 && !['academic-5','academic-10'].includes(trackKey)) tap(nextTime,.018);
    step++;nextTime+=duration;
  }
}
export async function startAudio(){
  try{
    const audio=getContext(); if(!audio)return false;
    await audio.resume();
    active=true;master.gain.cancelScheduledValues(audio.currentTime);
    master.gain.setTargetAtTime(volume*.18,audio.currentTime,.04);
    newBus();
    clearInterval(timer);timer=setInterval(schedule,25);schedule();
    return true;
  }catch{return false}
}
export function stopAudio(){
  active=false;clearInterval(timer);timer=null;
  if(context){master.gain.setTargetAtTime(.0001,context.currentTime,.025);context.suspend()}
}
export function setTrack(key){
  if(!(key in patterns))return;
  if(trackKey===key)return;
  trackKey=key;
  if(active)newBus();
}
export function setMusicVolume(value){
  volume=Math.max(0,Math.min(1,value));
  if(context&&active)master.gain.setTargetAtTime(volume*.18,context.currentTime,.04);
}
export function playSfx(name='select'){
  if(!active||!context)return;
  const t=context.currentTime+.007;
  if(name==='select'){tone(72,t,.06,'square',.11,master);return}
  if(name==='confirm'){tone(72,t,.075,'square',.13,master);tone(79,t+.07,.13,'triangle',.17,master);return}
  if(name==='impact'){tap(t,.25,master);tone(36,t,.3,'sawtooth',.18,master);return}
  if(name==='error'){tone(61,t,.13,'square',.13,master);tone(59,t+.13,.22,'triangle',.13,master);return}
  if(name==='xp'){tone(72,t,.08,'square',.12,master);tone(76,t+.085,.1,'square',.12,master);tone(79,t+.18,.18,'triangle',.18,master);return}
  if(name==='secret'){tone(67,t,.12,'triangle',.17,master);tone(72,t+.13,.12,'triangle',.17,master);tone(79,t+.27,.3,'triangle',.2,master);return}
  if(name==='save'){tone(60,t,.12,'triangle',.16,master);tone(64,t+.11,.12,'triangle',.15,master);tone(67,t+.22,.4,'triangle',.16,master)}
}
export function isAudioActive(){return active}
