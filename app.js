(()=>{
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),f=(v,n=2)=>Number(v).toFixed(n);
const home=$('home'),lab=$('lab'),game=$('game');
function show(name){home.style.display=name==='home'?'block':'none';lab.classList.toggle('active',name==='lab');game.classList.toggle('active',name==='game');if(name==='lab'){resizeLab();drawLab();drawGraph()}if(name==='game'){resizeGame();drawGame()}}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>show(b.dataset.mode));document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>show('home'));
// PHYSICS LAB
const sim=$('sim'),sc=sim.getContext('2d'),graph=$('graph'),gc=graph.getContext('2d');
const keys=['speed','angle','mass','gravity'];let p={speed:20,angle:45,mass:1,gravity:9.8},t=0,playing=false,last=0,raf=0,records=[];let sw=0,sh=0,gw=0,gh=0;
function m(){let a=p.angle*Math.PI/180,vx=p.speed*Math.cos(a),vy=p.speed*Math.sin(a),T=2*vy/p.gravity;return{vx,vy,T,R:vx*T,H:vy*vy/(2*p.gravity),peak:vy/p.gravity}}
function fit(c,x){let r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);c.width=Math.max(1,Math.round(r.width*d));c.height=Math.max(1,Math.round(r.height*d));x.setTransform(d,0,0,d,0,0);return[r.width,r.height]}
function resizeLab(){[sw,sh]=fit(sim,sc);[gw,gh]=fit(graph,gc)}
function update(){let q=m();$('height').innerHTML=`${f(q.H)} <small>m</small>`;$('flight').innerHTML=`${f(q.T)} <small>s</small>`;$('range').innerHTML=`${f(q.R)} <small>m</small>`;$('peak').innerHTML=`${f(q.peak)} <small>s</small>`;$('vx').textContent=f(q.vx)+' m/s';$('vy').textContent=f(q.vy)+' m/s';$('time').value=Math.round(t/q.T*1000);$('timeval').textContent=f(t)+' s'}
function arrow(x1,y1,x2,y2,color){let a=Math.atan2(y2-y1,x2-x1),h=7;sc.strokeStyle=color;sc.fillStyle=color;sc.lineWidth=2.4;sc.beginPath();sc.moveTo(x1,y1);sc.lineTo(x2,y2);sc.stroke();sc.beginPath();sc.moveTo(x2,y2);sc.lineTo(x2-h*Math.cos(a-.5),y2-h*Math.sin(a-.5));sc.lineTo(x2-h*Math.cos(a+.5),y2-h*Math.sin(a+.5));sc.closePath();sc.fill()}
function drawLab(){if(!sw||!sh)return;let q=m();sc.clearRect(0,0,sw,sh);sc.fillStyle='#091523';sc.fillRect(0,0,sw,sh);let L=43,R=15,T=29,B=30,pw=sw-L-R,ph=sh-T-B,mx=Math.max(5,q.R*1.15),my=Math.max(3,q.H*1.4),sx=pw/mx,sy=ph/my;
sc.strokeStyle='#26384d';sc.lineWidth=1;sc.font='9px DM Mono';for(let i=0;i<=8;i++){let x=L+pw*i/8;sc.beginPath();sc.moveTo(x,T);sc.lineTo(x,sh-B);sc.stroke();sc.fillStyle='#8196ab';sc.fillText(f(mx*i/8,1),x-8,sh-12)}for(let i=0;i<=5;i++){let y=T+ph*i/5;sc.beginPath();sc.moveTo(L,y);sc.lineTo(sw-R,y);sc.stroke();sc.fillStyle='#8196ab';sc.fillText(f(my*(5-i)/5,1),5,y+3)}
sc.strokeStyle='#91a4b8';sc.beginPath();sc.moveTo(L,T);sc.lineTo(L,sh-B);sc.lineTo(sw-R,sh-B);sc.stroke();let pos=u=>({x:L+q.vx*u*sx,y:sh-B-(q.vy*u-.5*p.gravity*u*u)*sy});sc.beginPath();for(let i=0;i<=140;i++){let z=pos(q.T*i/140);i?sc.lineTo(z.x,z.y):sc.moveTo(z.x,z.y)}sc.strokeStyle='#9cf0cb';sc.lineWidth=2.5;sc.shadowColor='#9cf0cb';sc.shadowBlur=10;sc.stroke();sc.shadowBlur=0;
let peak=pos(q.peak);sc.setLineDash([4,4]);sc.strokeStyle='#ffd27d88';sc.beginPath();sc.moveTo(peak.x,peak.y);sc.lineTo(peak.x,sh-B);sc.stroke();sc.setLineDash([]);
let z=pos(t),vx=q.vx,vy=q.vy-p.gravity*t,mag=Math.hypot(vx,vy),scale=clamp(25/(mag||1),.7,2.2);sc.fillStyle='#fff';sc.beginPath();sc.arc(z.x,z.y,6,0,Math.PI*2);sc.fill();arrow(z.x,z.y,z.x+vx*scale,z.y-vy*scale,'#ffd27d');arrow(z.x,z.y,z.x,z.y+28,'#ff947f');sc.fillStyle='#a4b5c6';sc.font='9px Manrope';sc.fillText('x (m)',sw-42,sh-7);sc.fillText('y (m)',8,17);$('simstatus').textContent=`t = ${f(t)} s · vₓ = ${f(vx)} m/s · vᵧ = ${f(vy)} m/s`;}
function drawGraph(){
 if(!gw||!gh)return;
 let q=m();
 gc.clearRect(0,0,gw,gh);
 gc.fillStyle='#101b2a';gc.fillRect(0,0,gw,gh);
 // Include all three velocity curves in the vertical range, with a little margin.
 let vals=[q.vx,q.vy,Math.hypot(q.vx,q.vy),q.vy-p.gravity*q.T,Math.hypot(q.vx,q.vy-p.gravity*q.T)];
 let vmin=Math.min(0,...vals),vmax=Math.max(0,...vals),pad=Math.max(1,(vmax-vmin)*.12);
 vmin-=pad;vmax+=pad;
 let L=48,R=14,T=22,B=38,pw=gw-L-R,ph=gh-T-B;
 let px=u=>L+u/q.T*pw,py=v=>T+(vmax-v)/(vmax-vmin)*ph;
 gc.font='9px DM Mono';gc.textBaseline='middle';gc.strokeStyle='#26384d';gc.lineWidth=1;
 // Horizontal grid and labelled velocity ticks.
 for(let i=0;i<=5;i++){
   let value=vmax-(vmax-vmin)*i/5,y=py(value);
   gc.beginPath();gc.moveTo(L,y);gc.lineTo(gw-R,y);gc.stroke();
   gc.fillStyle='#91a4b8';gc.textAlign='right';gc.fillText(f(value,1),L-7,y);
 }
 // Vertical grid and time ticks.
 for(let i=0;i<=5;i++){
   let x=L+pw*i/5;
   gc.beginPath();gc.moveTo(x,T);gc.lineTo(x,gh-B);gc.stroke();
   gc.fillStyle='#91a4b8';gc.textAlign='center';gc.fillText(f(q.T*i/5,1),x,gh-B+12);
 }
 // Axes and axis titles.
 gc.strokeStyle='#91a4b8';gc.lineWidth=1.2;gc.beginPath();gc.moveTo(L,T);gc.lineTo(L,gh-B);gc.lineTo(gw-R,gh-B);gc.stroke();
 gc.fillStyle='#b8c8d8';gc.font='10px Manrope';gc.textAlign='center';
 gc.fillText('시간 t (s)',L+pw/2,gh-7);
 gc.save();gc.translate(12,T+ph/2);gc.rotate(-Math.PI/2);gc.fillText('속도 v (m/s)',0,0);gc.restore();
 let plot=(fn,col)=>{gc.beginPath();for(let i=0;i<=160;i++){let u=q.T*i/160,x=px(u),y=py(fn(u));i?gc.lineTo(x,y):gc.moveTo(x,y)}gc.strokeStyle=col;gc.lineWidth=2.4;gc.stroke()};
 plot(()=>q.vx,'#73c9ee');
 plot(u=>q.vy-p.gravity*u,'#ff947f');
 plot(u=>Math.hypot(q.vx,q.vy-p.gravity*u),'#ffd27d');
 // Current simulation time marker and the instantaneous values on each curve.
 let vx=q.vx,vy=q.vy-p.gravity*t,speed=Math.hypot(vx,vy);
 let xNow=px(t);
 gc.strokeStyle='#9cf0cb';gc.lineWidth=1.5;gc.setLineDash([4,4]);
 gc.beginPath();gc.moveTo(xNow,T);gc.lineTo(xNow,gh-B);gc.stroke();gc.setLineDash([]);
 [[vx,'#73c9ee'],[vy,'#ff947f'],[speed,'#ffd27d']].forEach(([v,col])=>{
   gc.beginPath();gc.arc(xNow,py(v),4,0,Math.PI*2);gc.fillStyle=col;gc.fill();gc.strokeStyle='#101b2a';gc.lineWidth=1.5;gc.stroke();
 });
 gc.fillStyle='#9cf0cb';gc.font='9px DM Mono';gc.textAlign=xNow>gw-100?'right':'left';
 gc.fillText(`t=${f(t)} s`,xNow+(xNow>gw-100?-6:6),T+8);
}
function read(){keys.forEach(k=>{let el=$(k),v=Number(el.value),bounds={speed:[.1,100],angle:[1,89],mass:[.01,1000],gravity:[.1,40]}[k];if(!Number.isFinite(v))v=p[k];p[k]=clamp(v,...bounds);el.value=p[k]});t=clamp(t,0,m().T);update();drawLab();drawGraph()}
keys.forEach(k=>$(k).addEventListener('change',()=>{stop();read()}));function stop(){playing=false;cancelAnimationFrame(raf);$('play').textContent='▶ 재생'}
function frame(now){if(!playing)return;t+=Math.min((now-last)/1000,.04);last=now;if(t>=m().T){t=m().T;stop()}update();drawLab();drawGraph();if(playing)raf=requestAnimationFrame(frame)}
$('play').onclick=()=>{if(playing){stop();return}if(t>=m().T)t=0;playing=true;last=performance.now();$('play').textContent='Ⅱ 일시정지';raf=requestAnimationFrame(frame)};$('reset').onclick=()=>{stop();t=0;update();drawLab();drawGraph()};$('time').oninput=e=>{stop();t=m().T*Number(e.target.value)/1000;update();drawLab();drawGraph()};$('defaults').onclick=()=>{p={speed:20,angle:45,mass:1,gravity:9.8};keys.forEach(k=>$(k).value=p[k]);stop();t=0;read()};$('save').onclick=()=>{let q=m();records.push({...p,R:q.R});$('records').innerHTML=records.map((v,i)=>`<tr><td>${i+1}</td><td>${f(v.speed,1)}</td><td>${f(v.angle,0)}°</td><td>${f(v.mass,1)}</td><td>${f(v.gravity,1)}</td><td>${f(v.R)} m</td></tr>`).join('')};$('clear').onclick=()=>{records=[];$('records').innerHTML='<tr><td colspan="6">저장된 실험이 없습니다.</td></tr>'};
// 10-stage cartoon physics arcade. Purely digital game mechanics.
const canvas=$('gamecanvas'),c=canvas.getContext('2d');const stages=[['첫 번째 발사',2,3],['조금 더 멀리',3,3],['기둥 사이',3,3],['높이 쌓기',3,4],['엇갈린 탑',4,4],['좁은 통로',4,4],['두 개의 구조물',4,4],['높은 다리',5,5],['복잡한 탑',5,5],['마스터 챌린지',6,6]];let level=0,unlocked=1,shots=0,left=3,lastShot=null,targets=[],blocks=[],bird=null,aim=null,drag=false,trail=[],gameRaf=0,lastGame=0,ww=0,wh=0,cleared=false;
function resizeGame(){let r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,r.width*d);canvas.height=Math.max(1,r.height*d);c.setTransform(d,0,0,d,0,0);ww=r.width;wh=r.height}function ground(){return wh*.84}function sling(){return{x:ww*.15,y:ground()-32}}
function load(n){level=n;shots=0;left=stages[n][2];cleared=false;bird=null;aim=null;trail=[];let pattern=[[[.68,.72,.07,.17],[.77,.72,.07,.17],[.68,.56,.16,.05]],[[.72,.72,.06,.17],[.81,.72,.06,.17],[.72,.56,.15,.05],[.86,.58,.05,.14]],[[.60,.72,.06,.18],[.69,.72,.06,.18],[.78,.72,.06,.18],[.60,.56,.24,.05]],[[.70,.72,.06,.17],[.80,.72,.06,.17],[.70,.56,.16,.05],[.75,.40,.06,.16]],[[.61,.72,.06,.18],[.72,.72,.06,.18],[.83,.72,.06,.18],[.67,.55,.17,.05],[.72,.39,.06,.16]],[[.63,.72,.06,.18],[.83,.72,.06,.18],[.63,.55,.26,.05],[.73,.39,.06,.16]],[[.57,.72,.06,.18],[.66,.72,.06,.18],[.57,.56,.15,.05],[.80,.72,.06,.18],[.89,.72,.06,.18],[.80,.56,.15,.05]],[[.63,.72,.06,.18],[.84,.72,.06,.18],[.63,.56,.27,.05],[.73,.40,.06,.16]],[[.60,.72,.06,.18],[.69,.72,.06,.18],[.78,.72,.06,.18],[.60,.56,.24,.05],[.70,.40,.06,.16],[.81,.56,.06,.16]],[[.55,.72,.06,.18],[.65,.72,.06,.18],[.75,.72,.06,.18],[.85,.72,.06,.18],[.55,.56,.26,.05],[.66,.40,.06,.16],[.78,.40,.06,.16]]];blocks=pattern[n].map((b,i)=>({x:ww*b[0],y:wh*b[1],w:ww*b[2],h:wh*b[3],hp:n>5&&i%3===0?2:1,kind:i%3,alive:true}));targets=[];for(let i=0;i<stages[n][1];i++){let b=blocks[(i*2+1)%blocks.length];targets.push({x:b.x+b.w/2,y:b.y-11-(i%2)*5,r:10,alive:true})}$('overlay').classList.add('hidden');$('toast').textContent='새총을 뒤쪽으로 당겨 조준하고 놓으세요!';$('next').disabled=true;hud();drawGame()}
function hud(){let n=targets.filter(x=>x.alive).length;$('stagenum').textContent=String(level+1).padStart(2,'0');$('levelnum').textContent=String(level+1).padStart(2,'0');$('stagename').textContent=stages[level][0];$('shots').textContent=shots;$('targetcount').textContent=`${stages[level][1]-n} / ${stages[level][1]}`;$('ammo').textContent=`공 ${left}개 남음`;$('levels').innerHTML=stages.map((s,i)=>`<button class="${i<unlocked?'open':''} ${i===level?'current':''}" data-l="${i}" ${i>=unlocked?'disabled':''}>${String(i+1).padStart(2,'0')}</button>`).join('');document.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>load(Number(b.dataset.l)))}
function rr(x,y,w,h,r,fill,stroke){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);if(fill)c.fill();if(stroke)c.stroke()}
function drawGame(){if(!ww||!wh)resizeGame();c.clearRect(0,0,ww,wh);let sky=c.createLinearGradient(0,0,0,wh);sky.addColorStop(0,'#76c8df');sky.addColorStop(.7,'#d7ead3');sky.addColorStop(1,'#9ac68c');c.fillStyle=sky;c.fillRect(0,0,ww,wh);c.fillStyle='#fff0ba';c.beginPath();c.arc(ww*.82,wh*.16,25,0,7);c.fill();for(let i=0;i<4;i++){let x=(i*ww*.29+ww*.08)%(ww+50),y=wh*(.15+(i%2)*.1);c.fillStyle='#ffffffaa';c.beginPath();c.arc(x,y,12,0,7);c.arc(x+15,y-7,16,0,7);c.arc(x+31,y,11,0,7);c.fill()}c.fillStyle='#8cbd91';c.beginPath();c.moveTo(0,ground());c.quadraticCurveTo(ww*.25,wh*.52,ww*.48,ground());c.quadraticCurveTo(ww*.75,wh*.55,ww,ground());c.fill();c.fillStyle='#5c986d';c.fillRect(0,ground(),ww,wh-ground());c.fillStyle='#3f805d';c.fillRect(0,ground(),ww,8);let sl=sling();c.lineCap='round';c.strokeStyle='#784b31';c.lineWidth=12;c.beginPath();c.moveTo(sl.x-13,ground()+2);c.lineTo(sl.x-9,sl.y-28);c.moveTo(sl.x+12,ground()+2);c.lineTo(sl.x+8,sl.y-28);c.stroke();let px=bird?bird.x:(aim?aim.x:sl.x),py=bird?bird.y:(aim?aim.y:sl.y);c.strokeStyle='#5a4234';c.lineWidth=3;c.beginPath();c.moveTo(sl.x-8,sl.y-25);c.lineTo(px,py);c.moveTo(sl.x+8,sl.y-25);c.lineTo(px,py);c.stroke();blocks.forEach(b=>{if(!b.alive)return;c.fillStyle=['#d6a36c','#91b8b3','#c4cbd0'][b.kind];c.strokeStyle=['#9b704b','#608b87','#8999a3'][b.kind];c.lineWidth=2;rr(b.x,b.y,b.w,b.h,5,true,true);c.fillStyle='#ffffff55';c.fillRect(b.x+3,b.y+3,b.w-6,4)});targets.forEach(t=>{if(!t.alive)return;c.fillStyle='#76a94f';c.strokeStyle='#477a3e';c.lineWidth=2;c.beginPath();c.arc(t.x,t.y,t.r,0,7);c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(t.x-3,t.y-2,2.5,0,7);c.arc(t.x+4,t.y-2,2.5,0,7);c.fill();c.fillStyle='#344b31';c.beginPath();c.arc(t.x-3,t.y-2,1,0,7);c.arc(t.x+4,t.y-2,1,0,7);c.fill()});if(aim&&!bird){let dx=sl.x-aim.x,dy=sl.y-aim.y,v=Math.hypot(dx,dy)*5.5,a=Math.atan2(dy,dx);c.fillStyle='#fff';for(let i=0;i<22;i++){let u=i*.05,x=sl.x+v*Math.cos(a)*u,y=sl.y-v*Math.sin(a)*u+210*u*u;if(y>ground())break;c.globalAlpha=1-i/25;c.beginPath();c.arc(x,y,2,0,7);c.fill()}c.globalAlpha=1}if(trail.length>1){c.strokeStyle='#fff';c.setLineDash([4,6]);c.beginPath();trail.forEach((v,i)=>i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y));c.stroke();c.setLineDash([])}if(bird){c.fillStyle='#e9584f';c.strokeStyle='#ad3936';c.lineWidth=3;c.beginPath();c.arc(bird.x,bird.y,13,0,7);c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(bird.x+4,bird.y-4,4,0,7);c.fill();c.fillStyle='#26343a';c.beginPath();c.arc(bird.x+5,bird.y-4,1.7,0,7);c.fill();c.fillStyle='#f4c45e';c.beginPath();c.moveTo(bird.x+10,bird.y);c.lineTo(bird.x+19,bird.y+3);c.lineTo(bird.x+10,bird.y+5);c.fill()}hud()}
function pos(e){let r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}canvas.addEventListener('pointerdown',e=>{if(bird||cleared||left<=0)return;let q=pos(e),sl=sling();if(Math.hypot(q.x-sl.x,q.y-sl.y)<43){drag=true;aim=q;canvas.setPointerCapture(e.pointerId);drawGame()}});canvas.addEventListener('pointermove',e=>{if(!drag)return;let q=pos(e),sl=sling();aim={x:clamp(q.x,sl.x-65,sl.x+15),y:clamp(q.y,sl.y-75,sl.y+60)};drawGame()});canvas.addEventListener('pointerup',()=>{if(!drag)return;drag=false;let sl=sling(),dx=clamp(sl.x-aim.x,0,80),dy=clamp(sl.y-aim.y,-35,95);if(Math.hypot(dx,dy)>8)fire(dx,dy);aim=null;drawGame()});
function fire(dx,dy){if(bird||left<=0)return;let sl=sling(),a=Math.atan2(dy,dx),pull=Math.hypot(dx,dy),v=pull*5.5;lastShot={speed:clamp(6+pull*.38,6,36),angle:clamp(a*180/Math.PI,1,89)};$('analyzeShot').disabled=false;bird={x:sl.x,y:sl.y,vx:v*Math.cos(a),vy:-v*Math.sin(a),age:0};left--;shots++;trail=[];lastGame=performance.now();$('toast').textContent='날아가는 중! 구조물에 명중시켜 보세요.';gameRaf=requestAnimationFrame(tick);hud()}
function tick(now){if(!bird)return;let dt=Math.min((now-lastGame)/1000,.03);lastGame=now;let hit=false;for(let k=0;k<3;k++){let d=dt/3;bird.x+=bird.vx*d;bird.y+=bird.vy*d;bird.vy+=460*d;targets.forEach(t=>{if(t.alive&&Math.hypot(bird.x-t.x,bird.y-t.y)<t.r+11){t.alive=false;hit=true}});blocks.forEach(b=>{if(b.alive&&bird.x>b.x-12&&bird.x<b.x+b.w+12&&bird.y>b.y-12&&bird.y<b.y+b.h+12){b.hp--;if(b.hp<=0)b.alive=false;else{b.y+=6;b.x+=bird.vx*.01}hit=true}});if(hit){bird=null;break}}if(bird){bird.age+=dt;trail.push({x:bird.x,y:bird.y});if(trail.length>55)trail.shift();if(bird.y>ground()+15||bird.x>ww+20||bird.age>5)bird=null}if(targets.every(t=>!t.alive)){clearStage();return}drawGame();if(bird)gameRaf=requestAnimationFrame(tick);else $('toast').textContent=left?'공이 멈췄어요. 다시 조준해 보세요.':'공을 모두 사용했어요. 다시 시작해 보세요.'}
function clearStage(){cleared=true;bird=null;unlocked=Math.max(unlocked,Math.min(10,level+2));$('overlay').classList.remove('hidden');$('overlaytitle').textContent=level===9?'모든 스테이지 완료!':'스테이지 클리어!';$('overlaytext').textContent=`${shots}번 발사로 모든 목표를 찾았습니다.`;$('continue').textContent=level===9?'모드 선택으로':'다음 스테이지 →';$('next').disabled=level===9;drawGame()}
$('analyzeShot').onclick=()=>{if(!lastShot)return;show('lab');$('speed').value=lastShot.speed.toFixed(1);$('angle').value=lastShot.angle.toFixed(0);stop();t=0;read()};$('continue').onclick=()=>level===9?show('home'):load(level+1);$('next').onclick=()=>{if(level<9)load(level+1)};$('restart').onclick=()=>load(level);
window.addEventListener('resize',()=>{if(lab.classList.contains('active')){resizeLab();drawLab();drawGraph()}if(game.classList.contains('active')){resizeGame();load(level)}});
resizeLab();read();resizeGame();load(0);show('home');
})();
