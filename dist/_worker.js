var jn=Object.defineProperty;var Pt=e=>{throw TypeError(e)};var $n=(e,t,s)=>t in e?jn(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;var E=(e,t,s)=>$n(e,typeof t!="symbol"?t+"":t,s),Ct=(e,t,s)=>t.has(e)||Pt("Cannot "+s);var p=(e,t,s)=>(Ct(e,t,"read from private field"),s?s.call(e):t.get(e)),j=(e,t,s)=>t.has(e)?Pt("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),R=(e,t,s,n)=>(Ct(e,t,"write to private field"),n?n.call(e,s):t.set(e,s),s),L=(e,t,s)=>(Ct(e,t,"access private method"),s);var qt=(e,t,s,n)=>({set _(a){R(e,t,a,s)},get _(){return p(e,t,n)}});var Lt=(e,t,s)=>(n,a)=>{let r=-1;return i(0);async function i(c){if(c<=r)throw new Error("next() called multiple times");r=c;let l,o=!1,h;if(e[c]?(h=e[c][0][0],n.req.routeIndex=c):h=c===e.length&&a||void 0,h)try{l=await h(n,()=>i(c+1))}catch(m){if(m instanceof Error&&t)n.error=m,l=await t(m,n),o=!0;else throw m}else n.finalized===!1&&s&&(l=await s(n));return l&&(n.finalized===!1||o)&&(n.res=l),n}},In=Symbol(),Mn=async(e,t=Object.create(null))=>{const{all:s=!1,dot:n=!1}=t,r=(e instanceof on?e.raw.headers:e.headers).get("Content-Type");return r!=null&&r.startsWith("multipart/form-data")||r!=null&&r.startsWith("application/x-www-form-urlencoded")?Pn(e,{all:s,dot:n}):{}};async function Pn(e,t){const s=await e.formData();return s?qn(s,t):{}}function qn(e,t){const s=Object.create(null);return e.forEach((n,a)=>{t.all||a.endsWith("[]")?Ln(s,a,n):s[a]=n}),t.dot&&Object.entries(s).forEach(([n,a])=>{n.includes(".")&&(Fn(s,n,a),delete s[n])}),s}var Ln=(e,t,s)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(s):e[t]=[e[t],s]:t.endsWith("[]")?e[t]=[s]:e[t]=s},Fn=(e,t,s)=>{let n=e;const a=t.split(".");a.forEach((r,i)=>{i===a.length-1?n[r]=s:((!n[r]||typeof n[r]!="object"||Array.isArray(n[r])||n[r]instanceof File)&&(n[r]=Object.create(null)),n=n[r])})},tn=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},Hn=e=>{const{groups:t,path:s}=Bn(e),n=tn(s);return zn(n,t)},Bn=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(s,n)=>{const a=`@${n}`;return t.push([a,s]),a}),{groups:t,path:e}},zn=(e,t)=>{for(let s=t.length-1;s>=0;s--){const[n]=t[s];for(let a=e.length-1;a>=0;a--)if(e[a].includes(n)){e[a]=e[a].replace(n,t[s][1]);break}}return e},yt={},Un=(e,t)=>{if(e==="*")return"*";const s=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(s){const n=`${e}#${t}`;return yt[n]||(s[2]?yt[n]=t&&t[0]!==":"&&t[0]!=="*"?[n,s[1],new RegExp(`^${s[2]}(?=/${t})`)]:[e,s[1],new RegExp(`^${s[2]}$`)]:yt[n]=[e,s[1],!0]),yt[n]}return null},jt=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,s=>{try{return t(s)}catch{return s}})}},Wn=e=>jt(e,decodeURI),nn=e=>{const t=e.url,s=t.indexOf("/",t.indexOf(":")+4);let n=s;for(;n<t.length;n++){const a=t.charCodeAt(n);if(a===37){const r=t.indexOf("?",n),i=t.slice(s,r===-1?void 0:r);return Wn(i.includes("%25")?i.replace(/%25/g,"%2525"):i)}else if(a===63)break}return t.slice(s,n)},Jn=e=>{const t=nn(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},Ke=(e,t,...s)=>(s.length&&(t=Ke(t,...s)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),sn=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),s=[];let n="";return t.forEach(a=>{if(a!==""&&!/\:/.test(a))n+="/"+a;else if(/\:/.test(a))if(/\?/.test(a)){s.length===0&&n===""?s.push("/"):s.push(n);const r=a.replace("?","");n+="/"+r,s.push(n)}else n+="/"+a}),s.filter((a,r,i)=>i.indexOf(a)===r)},kt=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?jt(e,an):e):e,rn=(e,t,s)=>{let n;if(!s&&t&&!/[%+]/.test(t)){let i=e.indexOf(`?${t}`,8);for(i===-1&&(i=e.indexOf(`&${t}`,8));i!==-1;){const c=e.charCodeAt(i+t.length+1);if(c===61){const l=i+t.length+2,o=e.indexOf("&",l);return kt(e.slice(l,o===-1?void 0:o))}else if(c==38||isNaN(c))return"";i=e.indexOf(`&${t}`,i+1)}if(n=/[%+]/.test(e),!n)return}const a={};n??(n=/[%+]/.test(e));let r=e.indexOf("?",8);for(;r!==-1;){const i=e.indexOf("&",r+1);let c=e.indexOf("=",r);c>i&&i!==-1&&(c=-1);let l=e.slice(r+1,c===-1?i===-1?void 0:i:c);if(n&&(l=kt(l)),r=i,l==="")continue;let o;c===-1?o="":(o=e.slice(c+1,i===-1?void 0:i),n&&(o=kt(o))),s?(a[l]&&Array.isArray(a[l])||(a[l]=[]),a[l].push(o)):a[l]??(a[l]=o)}return t?a[t]:a},Vn=rn,Kn=(e,t)=>rn(e,t,!0),an=decodeURIComponent,Ft=e=>jt(e,an),Qe,fe,ke,ln,cn,At,Ae,Jt,on=(Jt=class{constructor(e,t="/",s=[[]]){j(this,ke);E(this,"raw");j(this,Qe);j(this,fe);E(this,"routeIndex",0);E(this,"path");E(this,"bodyCache",{});j(this,Ae,e=>{const{bodyCache:t,raw:s}=this,n=t[e];if(n)return n;const a=Object.keys(t)[0];return a?t[a].then(r=>(a==="json"&&(r=JSON.stringify(r)),new Response(r)[e]())):t[e]=s[e]()});this.raw=e,this.path=t,R(this,fe,s),R(this,Qe,{})}param(e){return e?L(this,ke,ln).call(this,e):L(this,ke,cn).call(this)}query(e){return Vn(this.url,e)}queries(e){return Kn(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((s,n)=>{t[n]=s}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await Mn(this,e))}json(){return p(this,Ae).call(this,"text").then(e=>JSON.parse(e))}text(){return p(this,Ae).call(this,"text")}arrayBuffer(){return p(this,Ae).call(this,"arrayBuffer")}blob(){return p(this,Ae).call(this,"blob")}formData(){return p(this,Ae).call(this,"formData")}addValidatedData(e,t){p(this,Qe)[e]=t}valid(e){return p(this,Qe)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[In](){return p(this,fe)}get matchedRoutes(){return p(this,fe)[0].map(([[,e]])=>e)}get routePath(){return p(this,fe)[0].map(([[,e]])=>e)[this.routeIndex].path}},Qe=new WeakMap,fe=new WeakMap,ke=new WeakSet,ln=function(e){const t=p(this,fe)[0][this.routeIndex][1][e],s=L(this,ke,At).call(this,t);return s&&/\%/.test(s)?Ft(s):s},cn=function(){const e={},t=Object.keys(p(this,fe)[0][this.routeIndex][1]);for(const s of t){const n=L(this,ke,At).call(this,p(this,fe)[0][this.routeIndex][1][s]);n!==void 0&&(e[s]=/\%/.test(n)?Ft(n):n)}return e},At=function(e){return p(this,fe)[1]?p(this,fe)[1][e]:e},Ae=new WeakMap,Jt),Gn={Stringify:1},un=async(e,t,s,n,a)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const r=e.callbacks;return r!=null&&r.length?(a?a[0]+=e:a=[e],Promise.all(r.map(c=>c({phase:t,buffer:a,context:n}))).then(c=>Promise.all(c.filter(Boolean).map(l=>un(l,t,!1,n,a))).then(()=>a[0]))):Promise.resolve(e)},Yn="text/plain; charset=UTF-8",Tt=(e,t)=>({"Content-Type":e,...t}),dt,ht,Se,Xe,Re,le,pt,Ze,et,Fe,ft,mt,Ne,Ge,Vt,Qn=(Vt=class{constructor(e,t){j(this,Ne);j(this,dt);j(this,ht);E(this,"env",{});j(this,Se);E(this,"finalized",!1);E(this,"error");j(this,Xe);j(this,Re);j(this,le);j(this,pt);j(this,Ze);j(this,et);j(this,Fe);j(this,ft);j(this,mt);E(this,"render",(...e)=>(p(this,Ze)??R(this,Ze,t=>this.html(t)),p(this,Ze).call(this,...e)));E(this,"setLayout",e=>R(this,pt,e));E(this,"getLayout",()=>p(this,pt));E(this,"setRenderer",e=>{R(this,Ze,e)});E(this,"header",(e,t,s)=>{this.finalized&&R(this,le,new Response(p(this,le).body,p(this,le)));const n=p(this,le)?p(this,le).headers:p(this,Fe)??R(this,Fe,new Headers);t===void 0?n.delete(e):s!=null&&s.append?n.append(e,t):n.set(e,t)});E(this,"status",e=>{R(this,Xe,e)});E(this,"set",(e,t)=>{p(this,Se)??R(this,Se,new Map),p(this,Se).set(e,t)});E(this,"get",e=>p(this,Se)?p(this,Se).get(e):void 0);E(this,"newResponse",(...e)=>L(this,Ne,Ge).call(this,...e));E(this,"body",(e,t,s)=>L(this,Ne,Ge).call(this,e,t,s));E(this,"text",(e,t,s)=>!p(this,Fe)&&!p(this,Xe)&&!t&&!s&&!this.finalized?new Response(e):L(this,Ne,Ge).call(this,e,t,Tt(Yn,s)));E(this,"json",(e,t,s)=>L(this,Ne,Ge).call(this,JSON.stringify(e),t,Tt("application/json",s)));E(this,"html",(e,t,s)=>{const n=a=>L(this,Ne,Ge).call(this,a,t,Tt("text/html; charset=UTF-8",s));return typeof e=="object"?un(e,Gn.Stringify,!1,{}).then(n):n(e)});E(this,"redirect",(e,t)=>{const s=String(e);return this.header("Location",/[^\x00-\xFF]/.test(s)?encodeURI(s):s),this.newResponse(null,t??302)});E(this,"notFound",()=>(p(this,et)??R(this,et,()=>new Response),p(this,et).call(this,this)));R(this,dt,e),t&&(R(this,Re,t.executionCtx),this.env=t.env,R(this,et,t.notFoundHandler),R(this,mt,t.path),R(this,ft,t.matchResult))}get req(){return p(this,ht)??R(this,ht,new on(p(this,dt),p(this,mt),p(this,ft))),p(this,ht)}get event(){if(p(this,Re)&&"respondWith"in p(this,Re))return p(this,Re);throw Error("This context has no FetchEvent")}get executionCtx(){if(p(this,Re))return p(this,Re);throw Error("This context has no ExecutionContext")}get res(){return p(this,le)||R(this,le,new Response(null,{headers:p(this,Fe)??R(this,Fe,new Headers)}))}set res(e){if(p(this,le)&&e){e=new Response(e.body,e);for(const[t,s]of p(this,le).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const n=p(this,le).headers.getSetCookie();e.headers.delete("set-cookie");for(const a of n)e.headers.append("set-cookie",a)}else e.headers.set(t,s)}R(this,le,e),this.finalized=!0}get var(){return p(this,Se)?Object.fromEntries(p(this,Se)):{}}},dt=new WeakMap,ht=new WeakMap,Se=new WeakMap,Xe=new WeakMap,Re=new WeakMap,le=new WeakMap,pt=new WeakMap,Ze=new WeakMap,et=new WeakMap,Fe=new WeakMap,ft=new WeakMap,mt=new WeakMap,Ne=new WeakSet,Ge=function(e,t,s){const n=p(this,le)?new Headers(p(this,le).headers):p(this,Fe)??new Headers;if(typeof t=="object"&&"headers"in t){const r=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[i,c]of r)i.toLowerCase()==="set-cookie"?n.append(i,c):n.set(i,c)}if(s)for(const[r,i]of Object.entries(s))if(typeof i=="string")n.set(r,i);else{n.delete(r);for(const c of i)n.append(r,c)}const a=typeof t=="number"?t:(t==null?void 0:t.status)??p(this,Xe);return new Response(e,{status:a,headers:n})},Vt),ee="ALL",Xn="all",Zn=["get","post","put","delete","options","patch"],dn="Can not add a route since the matcher is already built.",hn=class extends Error{},es="__COMPOSED_HANDLER",ts=e=>e.text("404 Not Found",404),Ht=(e,t)=>{if("getResponse"in e){const s=e.getResponse();return t.newResponse(s.body,s)}return console.error(e),t.text("Internal Server Error",500)},ge,te,fn,ye,qe,bt,_t,Kt,pn=(Kt=class{constructor(t={}){j(this,te);E(this,"get");E(this,"post");E(this,"put");E(this,"delete");E(this,"options");E(this,"patch");E(this,"all");E(this,"on");E(this,"use");E(this,"router");E(this,"getPath");E(this,"_basePath","/");j(this,ge,"/");E(this,"routes",[]);j(this,ye,ts);E(this,"errorHandler",Ht);E(this,"onError",t=>(this.errorHandler=t,this));E(this,"notFound",t=>(R(this,ye,t),this));E(this,"fetch",(t,...s)=>L(this,te,_t).call(this,t,s[1],s[0],t.method));E(this,"request",(t,s,n,a)=>t instanceof Request?this.fetch(s?new Request(t,s):t,n,a):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${Ke("/",t)}`,s),n,a)));E(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(L(this,te,_t).call(this,t.request,t,void 0,t.request.method))})});[...Zn,Xn].forEach(r=>{this[r]=(i,...c)=>(typeof i=="string"?R(this,ge,i):L(this,te,qe).call(this,r,p(this,ge),i),c.forEach(l=>{L(this,te,qe).call(this,r,p(this,ge),l)}),this)}),this.on=(r,i,...c)=>{for(const l of[i].flat()){R(this,ge,l);for(const o of[r].flat())c.map(h=>{L(this,te,qe).call(this,o.toUpperCase(),p(this,ge),h)})}return this},this.use=(r,...i)=>(typeof r=="string"?R(this,ge,r):(R(this,ge,"*"),i.unshift(r)),i.forEach(c=>{L(this,te,qe).call(this,ee,p(this,ge),c)}),this);const{strict:n,...a}=t;Object.assign(this,a),this.getPath=n??!0?t.getPath??nn:Jn}route(t,s){const n=this.basePath(t);return s.routes.map(a=>{var i;let r;s.errorHandler===Ht?r=a.handler:(r=async(c,l)=>(await Lt([],s.errorHandler)(c,()=>a.handler(c,l))).res,r[es]=a.handler),L(i=n,te,qe).call(i,a.method,a.path,r)}),this}basePath(t){const s=L(this,te,fn).call(this);return s._basePath=Ke(this._basePath,t),s}mount(t,s,n){let a,r;n&&(typeof n=="function"?r=n:(r=n.optionHandler,n.replaceRequest===!1?a=l=>l:a=n.replaceRequest));const i=r?l=>{const o=r(l);return Array.isArray(o)?o:[o]}:l=>{let o;try{o=l.executionCtx}catch{}return[l.env,o]};a||(a=(()=>{const l=Ke(this._basePath,t),o=l==="/"?0:l.length;return h=>{const m=new URL(h.url);return m.pathname=m.pathname.slice(o)||"/",new Request(m,h)}})());const c=async(l,o)=>{const h=await s(a(l.req.raw),...i(l));if(h)return h;await o()};return L(this,te,qe).call(this,ee,Ke(t,"*"),c),this}},ge=new WeakMap,te=new WeakSet,fn=function(){const t=new pn({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,R(t,ye,p(this,ye)),t.routes=this.routes,t},ye=new WeakMap,qe=function(t,s,n){t=t.toUpperCase(),s=Ke(this._basePath,s);const a={basePath:this._basePath,path:s,method:t,handler:n};this.router.add(t,s,[n,a]),this.routes.push(a)},bt=function(t,s){if(t instanceof Error)return this.errorHandler(t,s);throw t},_t=function(t,s,n,a){if(a==="HEAD")return(async()=>new Response(null,await L(this,te,_t).call(this,t,s,n,"GET")))();const r=this.getPath(t,{env:n}),i=this.router.match(a,r),c=new Qn(t,{path:r,matchResult:i,env:n,executionCtx:s,notFoundHandler:p(this,ye)});if(i[0].length===1){let o;try{o=i[0][0][0][0](c,async()=>{c.res=await p(this,ye).call(this,c)})}catch(h){return L(this,te,bt).call(this,h,c)}return o instanceof Promise?o.then(h=>h||(c.finalized?c.res:p(this,ye).call(this,c))).catch(h=>L(this,te,bt).call(this,h,c)):o??p(this,ye).call(this,c)}const l=Lt(i[0],this.errorHandler,p(this,ye));return(async()=>{try{const o=await l(c);if(!o.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return o.res}catch(o){return L(this,te,bt).call(this,o,c)}})()},Kt),mn=[];function ns(e,t){const s=this.buildAllMatchers(),n=(a,r)=>{const i=s[a]||s[ee],c=i[2][r];if(c)return c;const l=r.match(i[0]);if(!l)return[[],mn];const o=l.indexOf("",1);return[i[1][o],l]};return this.match=n,n(e,t)}var xt="[^/]+",lt=".*",ct="(?:|/.*)",Ye=Symbol(),ss=new Set(".\\+*[^]$()");function rs(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===lt||e===ct?1:t===lt||t===ct?-1:e===xt?1:t===xt?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var He,Be,be,Gt,Nt=(Gt=class{constructor(){j(this,He);j(this,Be);j(this,be,Object.create(null))}insert(t,s,n,a,r){if(t.length===0){if(p(this,He)!==void 0)throw Ye;if(r)return;R(this,He,s);return}const[i,...c]=t,l=i==="*"?c.length===0?["","",lt]:["","",xt]:i==="/*"?["","",ct]:i.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let o;if(l){const h=l[1];let m=l[2]||xt;if(h&&l[2]&&(m===".*"||(m=m.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(m))))throw Ye;if(o=p(this,be)[m],!o){if(Object.keys(p(this,be)).some(g=>g!==lt&&g!==ct))throw Ye;if(r)return;o=p(this,be)[m]=new Nt,h!==""&&R(o,Be,a.varIndex++)}!r&&h!==""&&n.push([h,p(o,Be)])}else if(o=p(this,be)[i],!o){if(Object.keys(p(this,be)).some(h=>h.length>1&&h!==lt&&h!==ct))throw Ye;if(r)return;o=p(this,be)[i]=new Nt}o.insert(c,s,n,a,r)}buildRegExpStr(){const s=Object.keys(p(this,be)).sort(rs).map(n=>{const a=p(this,be)[n];return(typeof p(a,Be)=="number"?`(${n})@${p(a,Be)}`:ss.has(n)?`\\${n}`:n)+a.buildRegExpStr()});return typeof p(this,He)=="number"&&s.unshift(`#${p(this,He)}`),s.length===0?"":s.length===1?s[0]:"(?:"+s.join("|")+")"}},He=new WeakMap,Be=new WeakMap,be=new WeakMap,Gt),Et,gt,Yt,as=(Yt=class{constructor(){j(this,Et,{varIndex:0});j(this,gt,new Nt)}insert(e,t,s){const n=[],a=[];for(let i=0;;){let c=!1;if(e=e.replace(/\{[^}]+\}/g,l=>{const o=`@\\${i}`;return a[i]=[o,l],i++,c=!0,o}),!c)break}const r=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let i=a.length-1;i>=0;i--){const[c]=a[i];for(let l=r.length-1;l>=0;l--)if(r[l].indexOf(c)!==-1){r[l]=r[l].replace(c,a[i][1]);break}}return p(this,gt).insert(r,t,n,p(this,Et),s),n}buildRegExp(){let e=p(this,gt).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const s=[],n=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(a,r,i)=>r!==void 0?(s[++t]=Number(r),"$()"):(i!==void 0&&(n[Number(i)]=++t),"")),[new RegExp(`^${e}`),s,n]}},Et=new WeakMap,gt=new WeakMap,Yt),is=[/^$/,[],Object.create(null)],vt=Object.create(null);function gn(e){return vt[e]??(vt[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,s)=>s?`\\${s}`:"(?:|/.*)")}$`))}function os(){vt=Object.create(null)}function ls(e){var o;const t=new as,s=[];if(e.length===0)return is;const n=e.map(h=>[!/\*|\/:/.test(h[0]),...h]).sort(([h,m],[g,_])=>h?1:g?-1:m.length-_.length),a=Object.create(null);for(let h=0,m=-1,g=n.length;h<g;h++){const[_,v,w]=n[h];_?a[v]=[w.map(([P])=>[P,Object.create(null)]),mn]:m++;let D;try{D=t.insert(v,m,_)}catch(P){throw P===Ye?new hn(v):P}_||(s[m]=w.map(([P,Q])=>{const ce=Object.create(null);for(Q-=1;Q>=0;Q--){const[B,ue]=D[Q];ce[B]=ue}return[P,ce]}))}const[r,i,c]=t.buildRegExp();for(let h=0,m=s.length;h<m;h++)for(let g=0,_=s[h].length;g<_;g++){const v=(o=s[h][g])==null?void 0:o[1];if(!v)continue;const w=Object.keys(v);for(let D=0,P=w.length;D<P;D++)v[w[D]]=c[v[w[D]]]}const l=[];for(const h in i)l[h]=s[i[h]];return[r,l,a]}function Ve(e,t){if(e){for(const s of Object.keys(e).sort((n,a)=>a.length-n.length))if(gn(s).test(t))return[...e[s]]}}var De,je,St,yn,Qt,cs=(Qt=class{constructor(){j(this,St);E(this,"name","RegExpRouter");j(this,De);j(this,je);E(this,"match",ns);R(this,De,{[ee]:Object.create(null)}),R(this,je,{[ee]:Object.create(null)})}add(e,t,s){var c;const n=p(this,De),a=p(this,je);if(!n||!a)throw new Error(dn);n[e]||[n,a].forEach(l=>{l[e]=Object.create(null),Object.keys(l[ee]).forEach(o=>{l[e][o]=[...l[ee][o]]})}),t==="/*"&&(t="*");const r=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const l=gn(t);e===ee?Object.keys(n).forEach(o=>{var h;(h=n[o])[t]||(h[t]=Ve(n[o],t)||Ve(n[ee],t)||[])}):(c=n[e])[t]||(c[t]=Ve(n[e],t)||Ve(n[ee],t)||[]),Object.keys(n).forEach(o=>{(e===ee||e===o)&&Object.keys(n[o]).forEach(h=>{l.test(h)&&n[o][h].push([s,r])})}),Object.keys(a).forEach(o=>{(e===ee||e===o)&&Object.keys(a[o]).forEach(h=>l.test(h)&&a[o][h].push([s,r]))});return}const i=sn(t)||[t];for(let l=0,o=i.length;l<o;l++){const h=i[l];Object.keys(a).forEach(m=>{var g;(e===ee||e===m)&&((g=a[m])[h]||(g[h]=[...Ve(n[m],h)||Ve(n[ee],h)||[]]),a[m][h].push([s,r-o+l+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(p(this,je)).concat(Object.keys(p(this,De))).forEach(t=>{e[t]||(e[t]=L(this,St,yn).call(this,t))}),R(this,De,R(this,je,void 0)),os(),e}},De=new WeakMap,je=new WeakMap,St=new WeakSet,yn=function(e){const t=[];let s=e===ee;return[p(this,De),p(this,je)].forEach(n=>{const a=n[e]?Object.keys(n[e]).map(r=>[r,n[e][r]]):[];a.length!==0?(s||(s=!0),t.push(...a)):e!==ee&&t.push(...Object.keys(n[ee]).map(r=>[r,n[ee][r]]))}),s?ls(t):null},Qt),$e,Oe,Xt,us=(Xt=class{constructor(e){E(this,"name","SmartRouter");j(this,$e,[]);j(this,Oe,[]);R(this,$e,e.routers)}add(e,t,s){if(!p(this,Oe))throw new Error(dn);p(this,Oe).push([e,t,s])}match(e,t){if(!p(this,Oe))throw new Error("Fatal error");const s=p(this,$e),n=p(this,Oe),a=s.length;let r=0,i;for(;r<a;r++){const c=s[r];try{for(let l=0,o=n.length;l<o;l++)c.add(...n[l]);i=c.match(e,t)}catch(l){if(l instanceof hn)continue;throw l}this.match=c.match.bind(c),R(this,$e,[c]),R(this,Oe,void 0);break}if(r===a)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,i}get activeRouter(){if(p(this,Oe)||p(this,$e).length!==1)throw new Error("No active router has been determined yet.");return p(this,$e)[0]}},$e=new WeakMap,Oe=new WeakMap,Xt),at=Object.create(null),Ie,oe,ze,tt,re,Ce,Le,Zt,bn=(Zt=class{constructor(e,t,s){j(this,Ce);j(this,Ie);j(this,oe);j(this,ze);j(this,tt,0);j(this,re,at);if(R(this,oe,s||Object.create(null)),R(this,Ie,[]),e&&t){const n=Object.create(null);n[e]={handler:t,possibleKeys:[],score:0},R(this,Ie,[n])}R(this,ze,[])}insert(e,t,s){R(this,tt,++qt(this,tt)._);let n=this;const a=Hn(t),r=[];for(let i=0,c=a.length;i<c;i++){const l=a[i],o=a[i+1],h=Un(l,o),m=Array.isArray(h)?h[0]:l;if(m in p(n,oe)){n=p(n,oe)[m],h&&r.push(h[1]);continue}p(n,oe)[m]=new bn,h&&(p(n,ze).push(h),r.push(h[1])),n=p(n,oe)[m]}return p(n,Ie).push({[e]:{handler:s,possibleKeys:r.filter((i,c,l)=>l.indexOf(i)===c),score:p(this,tt)}}),n}search(e,t){var c;const s=[];R(this,re,at);let a=[this];const r=tn(t),i=[];for(let l=0,o=r.length;l<o;l++){const h=r[l],m=l===o-1,g=[];for(let _=0,v=a.length;_<v;_++){const w=a[_],D=p(w,oe)[h];D&&(R(D,re,p(w,re)),m?(p(D,oe)["*"]&&s.push(...L(this,Ce,Le).call(this,p(D,oe)["*"],e,p(w,re))),s.push(...L(this,Ce,Le).call(this,D,e,p(w,re)))):g.push(D));for(let P=0,Q=p(w,ze).length;P<Q;P++){const ce=p(w,ze)[P],B=p(w,re)===at?{}:{...p(w,re)};if(ce==="*"){const f=p(w,oe)["*"];f&&(s.push(...L(this,Ce,Le).call(this,f,e,p(w,re))),R(f,re,B),g.push(f));continue}const[ue,G,O]=ce;if(!h&&!(O instanceof RegExp))continue;const u=p(w,oe)[ue],d=r.slice(l).join("/");if(O instanceof RegExp){const f=O.exec(d);if(f){if(B[G]=f[0],s.push(...L(this,Ce,Le).call(this,u,e,p(w,re),B)),Object.keys(p(u,oe)).length){R(u,re,B);const b=((c=f[0].match(/\//))==null?void 0:c.length)??0;(i[b]||(i[b]=[])).push(u)}continue}}(O===!0||O.test(h))&&(B[G]=h,m?(s.push(...L(this,Ce,Le).call(this,u,e,B,p(w,re))),p(u,oe)["*"]&&s.push(...L(this,Ce,Le).call(this,p(u,oe)["*"],e,B,p(w,re)))):(R(u,re,B),g.push(u)))}}a=g.concat(i.shift()??[])}return s.length>1&&s.sort((l,o)=>l.score-o.score),[s.map(({handler:l,params:o})=>[l,o])]}},Ie=new WeakMap,oe=new WeakMap,ze=new WeakMap,tt=new WeakMap,re=new WeakMap,Ce=new WeakSet,Le=function(e,t,s,n){const a=[];for(let r=0,i=p(e,Ie).length;r<i;r++){const c=p(e,Ie)[r],l=c[t]||c[ee],o={};if(l!==void 0&&(l.params=Object.create(null),a.push(l),s!==at||n&&n!==at))for(let h=0,m=l.possibleKeys.length;h<m;h++){const g=l.possibleKeys[h],_=o[l.score];l.params[g]=n!=null&&n[g]&&!_?n[g]:s[g]??(n==null?void 0:n[g]),o[l.score]=!0}}return a},Zt),Ue,en,ds=(en=class{constructor(){E(this,"name","TrieRouter");j(this,Ue);R(this,Ue,new bn)}add(e,t,s){const n=sn(t);if(n){for(let a=0,r=n.length;a<r;a++)p(this,Ue).insert(e,n[a],s);return}p(this,Ue).insert(e,t,s)}match(e,t){return p(this,Ue).search(e,t)}},Ue=new WeakMap,en),Pe=class extends pn{constructor(e={}){super(e),this.router=e.router??new us({routers:[new cs,new ds]})}},hs=e=>{const s={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},n=(r=>typeof r=="string"?r==="*"?()=>r:i=>r===i?i:null:typeof r=="function"?r:i=>r.includes(i)?i:null)(s.origin),a=(r=>typeof r=="function"?r:Array.isArray(r)?()=>r:()=>[])(s.allowMethods);return async function(i,c){var h;function l(m,g){i.res.headers.set(m,g)}const o=await n(i.req.header("origin")||"",i);if(o&&l("Access-Control-Allow-Origin",o),s.origin!=="*"){const m=i.req.header("Vary");m?l("Vary",m):l("Vary","Origin")}if(s.credentials&&l("Access-Control-Allow-Credentials","true"),(h=s.exposeHeaders)!=null&&h.length&&l("Access-Control-Expose-Headers",s.exposeHeaders.join(",")),i.req.method==="OPTIONS"){s.maxAge!=null&&l("Access-Control-Max-Age",s.maxAge.toString());const m=await a(i.req.header("origin")||"",i);m.length&&l("Access-Control-Allow-Methods",m.join(","));let g=s.allowHeaders;if(!(g!=null&&g.length)){const _=i.req.header("Access-Control-Request-Headers");_&&(g=_.split(/\s*,\s*/))}return g!=null&&g.length&&(l("Access-Control-Allow-Headers",g.join(",")),i.res.headers.append("Vary","Access-Control-Request-Headers")),i.res.headers.delete("Content-Length"),i.res.headers.delete("Content-Type"),new Response(null,{headers:i.res.headers,status:204,statusText:"No Content"})}await c()}},ps=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,Bt=(e,t=ms)=>{const s=/\.([a-zA-Z0-9]+?)$/,n=e.match(s);if(!n)return;let a=t[n[1]];return a&&a.startsWith("text")&&(a+="; charset=utf-8"),a},fs={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},ms=fs,gs=(...e)=>{let t=e.filter(a=>a!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const s=t.split("/"),n=[];for(const a of s)a===".."&&n.length>0&&n.at(-1)!==".."?n.pop():a!=="."&&n.push(a);return n.join("/")||"."},_n={br:".br",zstd:".zst",gzip:".gz"},ys=Object.keys(_n),bs="index.html",_s=e=>{const t=e.root??"./",s=e.path,n=e.join??gs;return async(a,r)=>{var h,m,g,_;if(a.finalized)return r();let i;if(e.path)i=e.path;else try{if(i=decodeURIComponent(a.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(i))throw new Error}catch{return await((h=e.onNotFound)==null?void 0:h.call(e,a.req.path,a)),r()}let c=n(t,!s&&e.rewriteRequestPath?e.rewriteRequestPath(i):i);e.isDir&&await e.isDir(c)&&(c=n(c,bs));const l=e.getContent;let o=await l(c,a);if(o instanceof Response)return a.newResponse(o.body,o);if(o){const v=e.mimes&&Bt(c,e.mimes)||Bt(c);if(a.header("Content-Type",v||"application/octet-stream"),e.precompressed&&(!v||ps.test(v))){const w=new Set((m=a.req.header("Accept-Encoding"))==null?void 0:m.split(",").map(D=>D.trim()));for(const D of ys){if(!w.has(D))continue;const P=await l(c+_n[D],a);if(P){o=P,a.header("Content-Encoding",D),a.header("Vary","Accept-Encoding",{append:!0});break}}}return await((g=e.onFound)==null?void 0:g.call(e,c,a)),a.body(o)}await((_=e.onNotFound)==null?void 0:_.call(e,c,a)),await r()}},vs=async(e,t)=>{let s;t&&t.manifest?typeof t.manifest=="string"?s=JSON.parse(t.manifest):s=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?s=JSON.parse(__STATIC_CONTENT_MANIFEST):s=__STATIC_CONTENT_MANIFEST;let n;t&&t.namespace?n=t.namespace:n=__STATIC_CONTENT;const a=s[e]||e;if(!a)return null;const r=await n.get(a,{type:"stream"});return r||null},ws=e=>async function(s,n){return _s({...e,getContent:async r=>vs(r,{manifest:e.manifest,namespace:e.namespace?e.namespace:s.env?s.env.__STATIC_CONTENT:void 0})})(s,n)},xs=e=>ws(e);function Es(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var wt={exports:{}};/* @license
Papa Parse
v5.5.3
https://github.com/mholt/PapaParse
License: MIT
*/var Ss=wt.exports,zt;function Rs(){return zt||(zt=1,(function(e,t){((s,n)=>{e.exports=n()})(Ss,function s(){var n=typeof self<"u"?self:typeof window<"u"?window:n!==void 0?n:{},a,r=!n.document&&!!n.postMessage,i=n.IS_PAPA_WORKER||!1,c={},l=0,o={};function h(u){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},(function(d){var f=ue(d);f.chunkSize=parseInt(f.chunkSize),d.step||d.chunk||(f.chunkSize=null),this._handle=new w(f),(this._handle.streamer=this)._config=f}).call(this,u),this.parseChunk=function(d,f){var b=parseInt(this._config.skipFirstNLines)||0;if(this.isFirstChunk&&0<b){let S=this._config.newline;S||(y=this._config.quoteChar||'"',S=this._handle.guessLineEndings(d,y)),d=[...d.split(S).slice(b)].join(S)}this.isFirstChunk&&O(this._config.beforeFirstChunk)&&(y=this._config.beforeFirstChunk(d))!==void 0&&(d=y),this.isFirstChunk=!1,this._halted=!1;var b=this._partialLine+d,y=(this._partialLine="",this._handle.parse(b,this._baseIndex,!this._finished));if(!this._handle.paused()&&!this._handle.aborted()){if(d=y.meta.cursor,b=(this._finished||(this._partialLine=b.substring(d-this._baseIndex),this._baseIndex=d),y&&y.data&&(this._rowCount+=y.data.length),this._finished||this._config.preview&&this._rowCount>=this._config.preview),i)n.postMessage({results:y,workerId:o.WORKER_ID,finished:b});else if(O(this._config.chunk)&&!f){if(this._config.chunk(y,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);this._completeResults=y=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(y.data),this._completeResults.errors=this._completeResults.errors.concat(y.errors),this._completeResults.meta=y.meta),this._completed||!b||!O(this._config.complete)||y&&y.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),b||y&&y.meta.paused||this._nextChunk(),y}this._halted=!0},this._sendError=function(d){O(this._config.error)?this._config.error(d):i&&this._config.error&&n.postMessage({workerId:o.WORKER_ID,error:d,finished:!1})}}function m(u){var d;(u=u||{}).chunkSize||(u.chunkSize=o.RemoteChunkSize),h.call(this,u),this._nextChunk=r?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(f){this._input=f,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(d=new XMLHttpRequest,this._config.withCredentials&&(d.withCredentials=this._config.withCredentials),r||(d.onload=G(this._chunkLoaded,this),d.onerror=G(this._chunkError,this)),d.open(this._config.downloadRequestBody?"POST":"GET",this._input,!r),this._config.downloadRequestHeaders){var f,b=this._config.downloadRequestHeaders;for(f in b)d.setRequestHeader(f,b[f])}var y;this._config.chunkSize&&(y=this._start+this._config.chunkSize-1,d.setRequestHeader("Range","bytes="+this._start+"-"+y));try{d.send(this._config.downloadRequestBody)}catch(S){this._chunkError(S.message)}r&&d.status===0&&this._chunkError()}},this._chunkLoaded=function(){d.readyState===4&&(d.status<200||400<=d.status?this._chunkError():(this._start+=this._config.chunkSize||d.responseText.length,this._finished=!this._config.chunkSize||this._start>=(f=>(f=f.getResponseHeader("Content-Range"))!==null?parseInt(f.substring(f.lastIndexOf("/")+1)):-1)(d),this.parseChunk(d.responseText)))},this._chunkError=function(f){f=d.statusText||f,this._sendError(new Error(f))}}function g(u){(u=u||{}).chunkSize||(u.chunkSize=o.LocalChunkSize),h.call(this,u);var d,f,b=typeof FileReader<"u";this.stream=function(y){this._input=y,f=y.slice||y.webkitSlice||y.mozSlice,b?((d=new FileReader).onload=G(this._chunkLoaded,this),d.onerror=G(this._chunkError,this)):d=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var y=this._input,S=(this._config.chunkSize&&(S=Math.min(this._start+this._config.chunkSize,this._input.size),y=f.call(y,this._start,S)),d.readAsText(y,this._config.encoding));b||this._chunkLoaded({target:{result:S}})},this._chunkLoaded=function(y){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(y.target.result)},this._chunkError=function(){this._sendError(d.error)}}function _(u){var d;h.call(this,u=u||{}),this.stream=function(f){return d=f,this._nextChunk()},this._nextChunk=function(){var f,b;if(!this._finished)return f=this._config.chunkSize,d=f?(b=d.substring(0,f),d.substring(f)):(b=d,""),this._finished=!d,this.parseChunk(b)}}function v(u){h.call(this,u=u||{});var d=[],f=!0,b=!1;this.pause=function(){h.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){h.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(y){this._input=y,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){b&&d.length===1&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),d.length?this.parseChunk(d.shift()):f=!0},this._streamData=G(function(y){try{d.push(typeof y=="string"?y:y.toString(this._config.encoding)),f&&(f=!1,this._checkIsFinished(),this.parseChunk(d.shift()))}catch(S){this._streamError(S)}},this),this._streamError=G(function(y){this._streamCleanUp(),this._sendError(y)},this),this._streamEnd=G(function(){this._streamCleanUp(),b=!0,this._streamData("")},this),this._streamCleanUp=G(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function w(u){var d,f,b,y,S=Math.pow(2,53),z=-S,de=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,W=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,C=this,J=0,k=0,ae=!1,A=!1,$=[],x={data:[],errors:[],meta:{}};function X(I){return u.skipEmptyLines==="greedy"?I.join("").trim()==="":I.length===1&&I[0].length===0}function Y(){if(x&&b&&(pe("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+o.DefaultDelimiter+"'"),b=!1),u.skipEmptyLines&&(x.data=x.data.filter(function(T){return!X(T)})),se()){let T=function(K,Z){O(u.transformHeader)&&(K=u.transformHeader(K,Z)),$.push(K)};if(x)if(Array.isArray(x.data[0])){for(var I=0;se()&&I<x.data.length;I++)x.data[I].forEach(T);x.data.splice(0,1)}else x.data.forEach(T)}function q(T,K){for(var Z=u.header?{}:[],F=0;F<T.length;F++){var H=F,M=T[F],M=((me,N)=>(U=>(u.dynamicTypingFunction&&u.dynamicTyping[U]===void 0&&(u.dynamicTyping[U]=u.dynamicTypingFunction(U)),(u.dynamicTyping[U]||u.dynamicTyping)===!0))(me)?N==="true"||N==="TRUE"||N!=="false"&&N!=="FALSE"&&((U=>{if(de.test(U)&&(U=parseFloat(U),z<U&&U<S))return 1})(N)?parseFloat(N):W.test(N)?new Date(N):N===""?null:N):N)(H=u.header?F>=$.length?"__parsed_extra":$[F]:H,M=u.transform?u.transform(M,H):M);H==="__parsed_extra"?(Z[H]=Z[H]||[],Z[H].push(M)):Z[H]=M}return u.header&&(F>$.length?pe("FieldMismatch","TooManyFields","Too many fields: expected "+$.length+" fields but parsed "+F,k+K):F<$.length&&pe("FieldMismatch","TooFewFields","Too few fields: expected "+$.length+" fields but parsed "+F,k+K)),Z}var V;x&&(u.header||u.dynamicTyping||u.transform)&&(V=1,!x.data.length||Array.isArray(x.data[0])?(x.data=x.data.map(q),V=x.data.length):x.data=q(x.data,0),u.header&&x.meta&&(x.meta.fields=$),k+=V)}function se(){return u.header&&$.length===0}function pe(I,q,V,T){I={type:I,code:q,message:V},T!==void 0&&(I.row=T),x.errors.push(I)}O(u.step)&&(y=u.step,u.step=function(I){x=I,se()?Y():(Y(),x.data.length!==0&&(J+=I.data.length,u.preview&&J>u.preview?f.abort():(x.data=x.data[0],y(x,C))))}),this.parse=function(I,q,V){var T=u.quoteChar||'"',T=(u.newline||(u.newline=this.guessLineEndings(I,T)),b=!1,u.delimiter?O(u.delimiter)&&(u.delimiter=u.delimiter(I),x.meta.delimiter=u.delimiter):((T=((K,Z,F,H,M)=>{var me,N,U,Te;M=M||[",","	","|",";",o.RECORD_SEP,o.UNIT_SEP];for(var We=0;We<M.length;We++){for(var ve,st=M[We],ie=0,we=0,ne=0,he=(U=void 0,new P({comments:H,delimiter:st,newline:Z,preview:10}).parse(K)),Ee=0;Ee<he.data.length;Ee++)F&&X(he.data[Ee])?ne++:(ve=he.data[Ee].length,we+=ve,U===void 0?U=ve:0<ve&&(ie+=Math.abs(ve-U),U=ve));0<he.data.length&&(we/=he.data.length-ne),(N===void 0||ie<=N)&&(Te===void 0||Te<we)&&1.99<we&&(N=ie,me=st,Te=we)}return{successful:!!(u.delimiter=me),bestDelimiter:me}})(I,u.newline,u.skipEmptyLines,u.comments,u.delimitersToGuess)).successful?u.delimiter=T.bestDelimiter:(b=!0,u.delimiter=o.DefaultDelimiter),x.meta.delimiter=u.delimiter),ue(u));return u.preview&&u.header&&T.preview++,d=I,f=new P(T),x=f.parse(d,q,V),Y(),ae?{meta:{paused:!0}}:x||{meta:{paused:!1}}},this.paused=function(){return ae},this.pause=function(){ae=!0,f.abort(),d=O(u.chunk)?"":d.substring(f.getCharIndex())},this.resume=function(){C.streamer._halted?(ae=!1,C.streamer.parseChunk(d,!0)):setTimeout(C.resume,3)},this.aborted=function(){return A},this.abort=function(){A=!0,f.abort(),x.meta.aborted=!0,O(u.complete)&&u.complete(x),d=""},this.guessLineEndings=function(K,T){K=K.substring(0,1048576);var T=new RegExp(D(T)+"([^]*?)"+D(T),"gm"),V=(K=K.replace(T,"")).split("\r"),T=K.split(`
`),K=1<T.length&&T[0].length<V[0].length;if(V.length===1||K)return`
`;for(var Z=0,F=0;F<V.length;F++)V[F][0]===`
`&&Z++;return Z>=V.length/2?`\r
`:"\r"}}function D(u){return u.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function P(u){var d=(u=u||{}).delimiter,f=u.newline,b=u.comments,y=u.step,S=u.preview,z=u.fastMode,de=null,W=!1,C=u.quoteChar==null?'"':u.quoteChar,J=C;if(u.escapeChar!==void 0&&(J=u.escapeChar),(typeof d!="string"||-1<o.BAD_DELIMITERS.indexOf(d))&&(d=","),b===d)throw new Error("Comment character same as delimiter");b===!0?b="#":(typeof b!="string"||-1<o.BAD_DELIMITERS.indexOf(b))&&(b=!1),f!==`
`&&f!=="\r"&&f!==`\r
`&&(f=`
`);var k=0,ae=!1;this.parse=function(A,$,x){if(typeof A!="string")throw new Error("Input must be a string");var X=A.length,Y=d.length,se=f.length,pe=b.length,I=O(y),q=[],V=[],T=[],K=k=0;if(!A)return ie();if(z||z!==!1&&A.indexOf(C)===-1){for(var Z=A.split(f),F=0;F<Z.length;F++){if(T=Z[F],k+=T.length,F!==Z.length-1)k+=f.length;else if(x)return ie();if(!b||T.substring(0,pe)!==b){if(I){if(q=[],Te(T.split(d)),we(),ae)return ie()}else Te(T.split(d));if(S&&S<=F)return q=q.slice(0,S),ie(!0)}}return ie()}for(var H=A.indexOf(d,k),M=A.indexOf(f,k),me=new RegExp(D(J)+D(C),"g"),N=A.indexOf(C,k);;)if(A[k]===C)for(N=k,k++;;){if((N=A.indexOf(C,N+1))===-1)return x||V.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:q.length,index:k}),ve();if(N===X-1)return ve(A.substring(k,N).replace(me,C));if(C===J&&A[N+1]===J)N++;else if(C===J||N===0||A[N-1]!==J){H!==-1&&H<N+1&&(H=A.indexOf(d,N+1));var U=We((M=M!==-1&&M<N+1?A.indexOf(f,N+1):M)===-1?H:Math.min(H,M));if(A.substr(N+1+U,Y)===d){T.push(A.substring(k,N).replace(me,C)),A[k=N+1+U+Y]!==C&&(N=A.indexOf(C,k)),H=A.indexOf(d,k),M=A.indexOf(f,k);break}if(U=We(M),A.substring(N+1+U,N+1+U+se)===f){if(T.push(A.substring(k,N).replace(me,C)),st(N+1+U+se),H=A.indexOf(d,k),N=A.indexOf(C,k),I&&(we(),ae))return ie();if(S&&q.length>=S)return ie(!0);break}V.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:q.length,index:k}),N++}}else if(b&&T.length===0&&A.substring(k,k+pe)===b){if(M===-1)return ie();k=M+se,M=A.indexOf(f,k),H=A.indexOf(d,k)}else if(H!==-1&&(H<M||M===-1))T.push(A.substring(k,H)),k=H+Y,H=A.indexOf(d,k);else{if(M===-1)break;if(T.push(A.substring(k,M)),st(M+se),I&&(we(),ae))return ie();if(S&&q.length>=S)return ie(!0)}return ve();function Te(ne){q.push(ne),K=k}function We(ne){var he=0;return he=ne!==-1&&(ne=A.substring(N+1,ne))&&ne.trim()===""?ne.length:he}function ve(ne){return x||(ne===void 0&&(ne=A.substring(k)),T.push(ne),k=X,Te(T),I&&we()),ie()}function st(ne){k=ne,Te(T),T=[],M=A.indexOf(f,k)}function ie(ne){if(u.header&&!$&&q.length&&!W){var he=q[0],Ee=Object.create(null),Ot=new Set(he);let It=!1;for(let Je=0;Je<he.length;Je++){let xe=he[Je];if(Ee[xe=O(u.transformHeader)?u.transformHeader(xe,Je):xe]){let rt,Mt=Ee[xe];for(;rt=xe+"_"+Mt,Mt++,Ot.has(rt););Ot.add(rt),he[Je]=rt,Ee[xe]++,It=!0,(de=de===null?{}:de)[rt]=xe}else Ee[xe]=1,he[Je]=xe;Ot.add(xe)}It&&console.warn("Duplicate headers found and renamed."),W=!0}return{data:q,errors:V,meta:{delimiter:d,linebreak:f,aborted:ae,truncated:!!ne,cursor:K+($||0),renamedHeaders:de}}}function we(){y(ie()),q=[],V=[]}},this.abort=function(){ae=!0},this.getCharIndex=function(){return k}}function Q(u){var d=u.data,f=c[d.workerId],b=!1;if(d.error)f.userError(d.error,d.file);else if(d.results&&d.results.data){var y={abort:function(){b=!0,ce(d.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:B,resume:B};if(O(f.userStep)){for(var S=0;S<d.results.data.length&&(f.userStep({data:d.results.data[S],errors:d.results.errors,meta:d.results.meta},y),!b);S++);delete d.results}else O(f.userChunk)&&(f.userChunk(d.results,y,d.file),delete d.results)}d.finished&&!b&&ce(d.workerId,d.results)}function ce(u,d){var f=c[u];O(f.userComplete)&&f.userComplete(d),f.terminate(),delete c[u]}function B(){throw new Error("Not implemented.")}function ue(u){if(typeof u!="object"||u===null)return u;var d,f=Array.isArray(u)?[]:{};for(d in u)f[d]=ue(u[d]);return f}function G(u,d){return function(){u.apply(d,arguments)}}function O(u){return typeof u=="function"}return o.parse=function(u,d){var f=(d=d||{}).dynamicTyping||!1;if(O(f)&&(d.dynamicTypingFunction=f,f={}),d.dynamicTyping=f,d.transform=!!O(d.transform)&&d.transform,!d.worker||!o.WORKERS_SUPPORTED)return f=null,o.NODE_STREAM_INPUT,typeof u=="string"?(u=(b=>b.charCodeAt(0)!==65279?b:b.slice(1))(u),f=new(d.download?m:_)(d)):u.readable===!0&&O(u.read)&&O(u.on)?f=new v(d):(n.File&&u instanceof File||u instanceof Object)&&(f=new g(d)),f.stream(u);(f=(()=>{var b;return!!o.WORKERS_SUPPORTED&&(b=(()=>{var y=n.URL||n.webkitURL||null,S=s.toString();return o.BLOB_URL||(o.BLOB_URL=y.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",S,")();"],{type:"text/javascript"})))})(),(b=new n.Worker(b)).onmessage=Q,b.id=l++,c[b.id]=b)})()).userStep=d.step,f.userChunk=d.chunk,f.userComplete=d.complete,f.userError=d.error,d.step=O(d.step),d.chunk=O(d.chunk),d.complete=O(d.complete),d.error=O(d.error),delete d.worker,f.postMessage({input:u,config:d,workerId:f.id})},o.unparse=function(u,d){var f=!1,b=!0,y=",",S=`\r
`,z='"',de=z+z,W=!1,C=null,J=!1,k=((()=>{if(typeof d=="object"){if(typeof d.delimiter!="string"||o.BAD_DELIMITERS.filter(function($){return d.delimiter.indexOf($)!==-1}).length||(y=d.delimiter),typeof d.quotes!="boolean"&&typeof d.quotes!="function"&&!Array.isArray(d.quotes)||(f=d.quotes),typeof d.skipEmptyLines!="boolean"&&typeof d.skipEmptyLines!="string"||(W=d.skipEmptyLines),typeof d.newline=="string"&&(S=d.newline),typeof d.quoteChar=="string"&&(z=d.quoteChar),typeof d.header=="boolean"&&(b=d.header),Array.isArray(d.columns)){if(d.columns.length===0)throw new Error("Option columns is empty");C=d.columns}d.escapeChar!==void 0&&(de=d.escapeChar+z),d.escapeFormulae instanceof RegExp?J=d.escapeFormulae:typeof d.escapeFormulae=="boolean"&&d.escapeFormulae&&(J=/^[=+\-@\t\r].*$/)}})(),new RegExp(D(z),"g"));if(typeof u=="string"&&(u=JSON.parse(u)),Array.isArray(u)){if(!u.length||Array.isArray(u[0]))return ae(null,u,W);if(typeof u[0]=="object")return ae(C||Object.keys(u[0]),u,W)}else if(typeof u=="object")return typeof u.data=="string"&&(u.data=JSON.parse(u.data)),Array.isArray(u.data)&&(u.fields||(u.fields=u.meta&&u.meta.fields||C),u.fields||(u.fields=Array.isArray(u.data[0])?u.fields:typeof u.data[0]=="object"?Object.keys(u.data[0]):[]),Array.isArray(u.data[0])||typeof u.data[0]=="object"||(u.data=[u.data])),ae(u.fields||[],u.data||[],W);throw new Error("Unable to serialize unrecognized input");function ae($,x,X){var Y="",se=(typeof $=="string"&&($=JSON.parse($)),typeof x=="string"&&(x=JSON.parse(x)),Array.isArray($)&&0<$.length),pe=!Array.isArray(x[0]);if(se&&b){for(var I=0;I<$.length;I++)0<I&&(Y+=y),Y+=A($[I],I);0<x.length&&(Y+=S)}for(var q=0;q<x.length;q++){var V=(se?$:x[q]).length,T=!1,K=se?Object.keys(x[q]).length===0:x[q].length===0;if(X&&!se&&(T=X==="greedy"?x[q].join("").trim()==="":x[q].length===1&&x[q][0].length===0),X==="greedy"&&se){for(var Z=[],F=0;F<V;F++){var H=pe?$[F]:F;Z.push(x[q][H])}T=Z.join("").trim()===""}if(!T){for(var M=0;M<V;M++){0<M&&!K&&(Y+=y);var me=se&&pe?$[M]:M;Y+=A(x[q][me],M)}q<x.length-1&&(!X||0<V&&!K)&&(Y+=S)}}return Y}function A($,x){var X,Y;return $==null?"":$.constructor===Date?JSON.stringify($).slice(1,25):(Y=!1,J&&typeof $=="string"&&J.test($)&&($="'"+$,Y=!0),X=$.toString().replace(k,de),(Y=Y||f===!0||typeof f=="function"&&f($,x)||Array.isArray(f)&&f[x]||((se,pe)=>{for(var I=0;I<pe.length;I++)if(-1<se.indexOf(pe[I]))return!0;return!1})(X,o.BAD_DELIMITERS)||-1<X.indexOf(y)||X.charAt(0)===" "||X.charAt(X.length-1)===" ")?z+X+z:X)}},o.RECORD_SEP="",o.UNIT_SEP="",o.BYTE_ORDER_MARK="\uFEFF",o.BAD_DELIMITERS=["\r",`
`,'"',o.BYTE_ORDER_MARK],o.WORKERS_SUPPORTED=!r&&!!n.Worker,o.NODE_STREAM_INPUT=1,o.LocalChunkSize=10485760,o.RemoteChunkSize=5242880,o.DefaultDelimiter=",",o.Parser=P,o.ParserHandle=w,o.NetworkStreamer=m,o.FileStreamer=g,o.StringStreamer=_,o.ReadableStreamStreamer=v,n.jQuery&&((a=n.jQuery).fn.parse=function(u){var d=u.config||{},f=[];return this.each(function(S){if(!(a(this).prop("tagName").toUpperCase()==="INPUT"&&a(this).attr("type").toLowerCase()==="file"&&n.FileReader)||!this.files||this.files.length===0)return!0;for(var z=0;z<this.files.length;z++)f.push({file:this.files[z],inputElem:this,instanceConfig:a.extend({},d)})}),b(),this;function b(){if(f.length===0)O(u.complete)&&u.complete();else{var S,z,de,W,C=f[0];if(O(u.before)){var J=u.before(C.file,C.inputElem);if(typeof J=="object"){if(J.action==="abort")return S="AbortError",z=C.file,de=C.inputElem,W=J.reason,void(O(u.error)&&u.error({name:S},z,de,W));if(J.action==="skip")return void y();typeof J.config=="object"&&(C.instanceConfig=a.extend(C.instanceConfig,J.config))}else if(J==="skip")return void y()}var k=C.instanceConfig.complete;C.instanceConfig.complete=function(ae){O(k)&&k(ae,C.file,C.inputElem),y()},o.parse(C.file,C.instanceConfig)}}function y(){f.splice(0,1),b()}}),i&&(n.onmessage=function(u){u=u.data,o.WORKER_ID===void 0&&u&&(o.WORKER_ID=u.workerId),typeof u.input=="string"?n.postMessage({workerId:o.WORKER_ID,results:o.parse(u.input,u.config),finished:!0}):(n.File&&u.input instanceof File||u.input instanceof Object)&&(u=o.parse(u.input,u.config))&&n.postMessage({workerId:o.WORKER_ID,results:u,finished:!0})}),(m.prototype=Object.create(h.prototype)).constructor=m,(g.prototype=Object.create(h.prototype)).constructor=g,(_.prototype=Object.create(_.prototype)).constructor=_,(v.prototype=Object.create(h.prototype)).constructor=v,o})})(wt)),wt.exports}var Os=Rs();const Cs=Es(Os);function ks(e,t={}){const{maxRows:s=1e4}=t,n=Cs.parse(e,{header:!0,dynamicTyping:!0,skipEmptyLines:!0,transformHeader:a=>a.trim(),preview:s});return n.errors.length>0&&console.warn("CSV parsing warnings:",n.errors.slice(0,5)),n.data}function Ts(e){if(e.length===0)return{};const t=Object.keys(e[0]),s={};for(const n of t){const a=e.slice(0,Math.min(100,e.length)).map(r=>r[n]);s[n]=As(a)}return s}function As(e){const t=e.filter(r=>r!=null&&r!=="");if(t.length===0)return"string";if(t.filter(r=>typeof r=="number"&&!isNaN(r)).length===t.length)return"number";if(t.filter(r=>typeof r=="boolean").length===t.length)return"boolean";const a=t.filter(r=>{if(typeof r=="string"){const i=Date.parse(r);return!isNaN(i)}return!1}).length;return a===t.length&&a>0?"date":"string"}function Ns(e,t){const s=[];for(const n of e){const a=n.name.toLowerCase();if(!((a.endsWith("id")||a.endsWith("_id")||a==="id")&&n.type==="number"))continue;const i=n.name.replace(/[_-]?id$/i,""),c=[`${i}Name`,`${i}_name`,`${i}name`,`${i.toLowerCase()}name`,`${i}`];for(const l of c){const o=e.find(h=>h.name.toLowerCase()===l.toLowerCase()&&h.type==="string");if(o){const h=n.unique_count/t,m=o.unique_count/t;let g=.5;Math.abs(h-m)<.2?g=.9:Math.abs(h-m)<.4&&(g=.7),s.push({id_column:n.name,name_column:o.name,confidence:g});break}}}return s.filter(n=>n.confidence>=.5)}function Ds(e,t){if(t.length===0)return e;const s=new Map;for(const n of t){const a=new Map;for(const r of e){const i=r[n.id_column],c=r[n.name_column];i!=null&&c&&a.set(i,c)}s.set(n.id_column,a)}return e.map(n=>{const a={...n};for(const r of t){const i=a[r.id_column],c=s.get(r.id_column);c&&c.has(i)&&(a[`${r.id_column}_original`]=i,a[r.id_column]=c.get(i))}return a})}const vn=new Pe;vn.post("/",async e=>{try{const s=(await e.req.formData()).get("file");if(!s)return e.json({error:"No file provided"},400);const n=s.name,a=n.endsWith(".csv")?"csv":n.endsWith(".json")?"json":null;if(!a)return e.json({error:"Unsupported file type. Please upload CSV or JSON."},400);if(s.size>5*1024*1024)return e.json({error:"File too large. Maximum size is 5MB."},400);const r=await s.text();let i;if(a==="csv")i=ks(r);else try{const v=JSON.parse(r);i=Array.isArray(v)?v:[v]}catch{return e.json({error:"Invalid JSON format"},400)}if(i.length===0)return e.json({error:"File contains no data"},400);if(i.length>1e4)return e.json({error:"Dataset too large. Maximum 10,000 rows supported."},400);const c=Ts(i),l=Object.keys(i[0]).map(v=>({name:v,type:c[v]||"string",nullable:i.some(w=>w[v]===null||w[v]===void 0||w[v]===""),unique_count:new Set(i.map(w=>w[v])).size,sample_values:i.slice(0,3).map(w=>w[v])})),h=(await e.env.DB.prepare(`
      INSERT INTO datasets (name, original_filename, file_type, row_count, column_count, columns, analysis_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(n.replace(/\.[^.]+$/,""),n,a,i.length,l.length,JSON.stringify(l),"analyzing").run()).meta.last_row_id,m=i.map((v,w)=>e.env.DB.prepare(`
        INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned)
        VALUES (?, ?, ?, ?)
      `).bind(h,w,JSON.stringify(v),0)),g=100;for(let v=0;v<m.length;v+=g){const w=m.slice(v,v+g);await e.env.DB.batch(w)}console.log("Detecting column mappings...");const _=Ns(l,i.length);console.log(`Detected ${_.length} column mappings`);for(const v of _)await e.env.DB.prepare(`
        INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
        VALUES (?, ?, ?, 1)
      `).bind(h,v.id_column,v.name_column).run(),console.log(`  Mapped: ${v.id_column} -> ${v.name_column} (confidence: ${v.confidence})`);return e.json({success:!0,dataset_id:h,message:"Upload successful. Analysis started.",row_count:i.length,column_count:l.length,columns:l})}catch(t){return console.error("Upload error:",t),e.json({error:"Upload failed: "+t.message},500)}});const nt=new Pe;nt.get("/",async e=>{try{const s=(await e.env.DB.prepare(`
      SELECT * FROM datasets ORDER BY upload_date DESC
    `).all()).results.map(n=>({...n,columns:JSON.parse(n.columns)}));return e.json({datasets:s})}catch{return e.json({error:"Failed to fetch datasets"},500)}});nt.get("/:id",async e=>{try{const t=e.req.param("id"),s=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!s)return e.json({error:"Dataset not found"},404);const a=(await e.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0 LIMIT 10
    `).bind(t).all()).results.map(r=>JSON.parse(r.data));return e.json({dataset:{...s,columns:JSON.parse(s.columns)},sample:a})}catch{return e.json({error:"Failed to fetch dataset"},500)}});nt.get("/:id/analyses",async e=>{try{const t=e.req.param("id"),n=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ? ORDER BY quality_score DESC, confidence DESC
    `).bind(t).all()).results.map(a=>({...a,result:JSON.parse(a.result)}));return e.json({analyses:n})}catch{return e.json({error:"Failed to fetch analyses"},500)}});nt.get("/:id/visualizations",async e=>{try{const t=e.req.param("id"),n=(await e.env.DB.prepare(`
      SELECT * FROM visualizations WHERE dataset_id = ? ORDER BY display_order
    `).bind(t).all()).results.map(a=>({...a,config:JSON.parse(a.config)}));return e.json({visualizations:n})}catch{return e.json({error:"Failed to fetch visualizations"},500)}});nt.delete("/:id",async e=>{try{const t=e.req.param("id");return await e.env.DB.prepare(`
      DELETE FROM datasets WHERE id = ?
    `).bind(t).run(),e.json({success:!0,message:"Dataset deleted"})}catch{return e.json({error:"Failed to delete dataset"},500)}});function js(e,t){const s=e.filter(r=>r!=null&&r!==""),n=e.length-s.length,a=new Set(s).size;if(t==="number"){const r=s.map(i=>Number(i)).filter(i=>!isNaN(i));return{count:e.length,mean:Me(r),median:$s(r),mode:Ut(r),stdDev:Is(r),min:Math.min(...r),max:Math.max(...r),q1:ut(r,25),q2:ut(r,50),q3:ut(r,75),nullCount:n,uniqueCount:a}}return{count:e.length,mode:Ut(s),min:s[0],max:s[s.length-1],nullCount:n,uniqueCount:a}}function Me(e){return e.length===0?0:e.reduce((t,s)=>t+s,0)/e.length}function $s(e){if(e.length===0)return 0;const t=[...e].sort((n,a)=>n-a),s=Math.floor(t.length/2);return t.length%2===0?(t[s-1]+t[s])/2:t[s]}function Ut(e){if(e.length===0)return null;const t={};let s=0,n=null;for(const a of e){const r=String(a);t[r]=(t[r]||0)+1,t[r]>s&&(s=t[r],n=a)}return n}function Is(e){if(e.length===0)return 0;const t=Me(e),s=e.map(n=>Math.pow(n-t,2));return Math.sqrt(Me(s))}function ut(e,t){if(e.length===0)return 0;const s=[...e].sort((c,l)=>c-l),n=t/100*(s.length-1),a=Math.floor(n),r=Math.ceil(n),i=n%1;return a===r?s[a]:s[a]*(1-i)+s[r]*i}function Ms(e){if(e.length<4)return{indices:[],threshold:0};const t=ut(e,25),s=ut(e,75),n=s-t,a=t-1.5*n,r=s+1.5*n,i=[];return e.forEach((c,l)=>{(c<a||c>r)&&i.push(l)}),{indices:i,threshold:n}}function Ps(e,t){if(e.length!==t.length||e.length===0)return 0;const s=e.length,n=Me(e),a=Me(t);let r=0,i=0,c=0;for(let l=0;l<s;l++){const o=e[l]-n,h=t[l]-a;r+=o*h,i+=o*o,c+=h*h}return i===0||c===0?0:r/Math.sqrt(i*c)}function qs(e){if(e.length<2)return{direction:"stable",strength:0};const t=e.length,s=Array.from({length:t},(o,h)=>h),n=Me(s),a=Me(e);let r=0,i=0;for(let o=0;o<t;o++)r+=(s[o]-n)*(e[o]-a),i+=Math.pow(s[o]-n,2);const c=i===0?0:r/i,l=Math.min(Math.abs(c)/(Me(e)||1),1);return Math.abs(c)<.01?{direction:"stable",strength:0}:{direction:c>0?"up":"down",strength:l}}function it(e,t,s,n){var i;let a=50;const r=[];if(t){const c=t.toLowerCase();(c.includes("id")||c==="index")&&(a-=30,r.push("Identifier column (typically unique values)")),c.includes("name")&&n.uniqueCount/n.count>.8&&(a-=25,r.push("High cardinality name column")),(c.includes("email")||c.includes("phone")||c.includes("address"))&&(a-=30,r.push("Personal identifier (typically unique)")),(c.includes("time")||c.includes("date"))&&n.uniqueCount/n.count>.9&&(a-=20,r.push("High precision timestamp"))}switch(e){case"statistics":n.uniqueCount===1?(a-=40,r.push("All values are identical")):n.uniqueCount===n.count?(a-=35,r.push("All values are unique (no patterns)")):n.uniqueCount/n.count>.9?(a-=25,r.push("Very high cardinality (few patterns)")):n.uniqueCount/n.count<.1&&(a+=20,r.push("Low cardinality (clear patterns)")),n.stdDev!==void 0&&n.mean!==void 0&&n.stdDev/Math.abs(n.mean||1)>.5&&(a+=15,r.push("High variability in data"));break;case"correlation":const c=Math.abs(s.correlation||0);c>.8?(a+=30,r.push("Very strong correlation")):c>.6?(a+=20,r.push("Strong correlation")):c>.5&&(a+=10,r.push("Moderate correlation"));break;case"outlier":const o=(s.count||0)/(n.count||1);o>.05&&o<.2?(a+=25,r.push("Significant outliers detected")):o>0&&(a+=10,r.push("Some outliers present"));break;case"pattern":const h=(i=s.topPatterns)==null?void 0:i[0];if(h){const[,g]=h,_=g/n.count;_>.3&&_<.9&&(a+=20,r.push("Clear dominant pattern"))}break;case"trend":const m=s.strength||0;m>.5?(a+=30,r.push("Strong trend detected")):m>.3&&(a+=15,r.push("Moderate trend"));break}if(n.nullCount>0){const c=n.nullCount/n.count;c>.5?(a-=30,r.push("More than 50% missing data")):c>.2&&(a-=15,r.push("Significant missing data"))}return a=Math.max(0,Math.min(100,a)),{score:a,reasons:r}}async function Ls(e,t,s,n){console.log(`Starting analysis for dataset ${e}`);for(const r of s){const i=t.map(m=>m[r.name]),c=js(i,r.type),l=Fs(r.name,r.type,c),o=Bs(c,r.type),h=it("statistics",r.name,c,c);if(await n.prepare(`
      INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(e,"statistics",r.name,JSON.stringify(c),1,l,o,h.score).run(),r.type==="number"){const m=i.map(_=>Number(_)).filter(_=>!isNaN(_)),g=Ms(m);if(g.indices.length>0){const _=`Found ${g.indices.length} unusual values in "${r.name}" (${(g.indices.length/m.length*100).toFixed(1)}% of data). These values are significantly different from the rest and might need attention.`,v={count:g.indices.length,indices:g.indices.slice(0,10)},w=it("outlier",r.name,v,c);await n.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(e,"outlier",r.name,JSON.stringify(v),.85,_,g.indices.length>m.length*.05?"high":"medium",w.score).run()}if(m.length>5){const _=qs(m);if(_.direction!=="stable"){const v=`"${r.name}" shows a ${_.direction==="up"?"rising":"falling"} trend with ${(_.strength*100).toFixed(0)}% strength. This ${_.direction==="up"?"increase":"decrease"} is consistent across the dataset.`,w=it("trend",r.name,_,c);await n.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(e,"trend",r.name,JSON.stringify(_),_.strength,v,_.strength>.5?"high":"medium",w.score).run()}}}}const a=s.filter(r=>r.type==="number");for(let r=0;r<a.length;r++)for(let i=r+1;i<a.length;i++){const c=a[r],l=a[i],o=t.map(m=>Number(m[c.name])).filter(m=>!isNaN(m)),h=t.map(m=>Number(m[l.name])).filter(m=>!isNaN(m));if(o.length>5&&h.length>5){const m=Ps(o,h);if(Math.abs(m)>.5){const g=Hs(c.name,l.name,m),_={column1:c.name,column2:l.name,correlation:m},v=it("correlation",void 0,_,{count:o.length});await n.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(e,"correlation",`${c.name}_vs_${l.name}`,JSON.stringify(_),Math.abs(m),g,Math.abs(m)>.7?"high":"medium",v.score).run()}}}for(const r of s)if(r.type==="string"){const i=t.map(h=>h[r.name]).filter(h=>h),c={};i.forEach(h=>{c[h]=(c[h]||0)+1});const o=Object.entries(c).sort((h,m)=>m[1]-h[1]).slice(0,5);if(o.length>0&&o[0][1]>i.length*.1){const h=`The most common value in "${r.name}" is "${o[0][0]}" appearing ${o[0][1]} times (${(o[0][1]/i.length*100).toFixed(1)}% of records).`,m={topPatterns:o},g={count:i.length,uniqueCount:new Set(i).size},_=it("pattern",r.name,m,g);await n.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(e,"pattern",r.name,JSON.stringify(m),.9,h,"medium",_.score).run()}}console.log(`Analysis complete for dataset ${e}`)}function Fs(e,t,s){var n,a,r,i;return t==="number"?`"${e}" ranges from ${(n=s.min)==null?void 0:n.toFixed(2)} to ${(a=s.max)==null?void 0:a.toFixed(2)} with an average of ${(r=s.mean)==null?void 0:r.toFixed(2)}. About half the values are below ${(i=s.median)==null?void 0:i.toFixed(2)}.`:`"${e}" contains ${s.count} values with ${s.uniqueCount} unique entries. Most common: "${s.mode}".`}function Hs(e,t,s){const n=Math.abs(s)>.7?"strong":"moderate";return s>0?`There's a ${n} relationship between "${e}" and "${t}": when ${e} increases, ${t} tends to increase too (correlation: ${s.toFixed(2)}).`:`There's a ${n} inverse relationship between "${e}" and "${t}": when ${e} increases, ${t} tends to decrease (correlation: ${s.toFixed(2)}).`}function Bs(e,t){return e.nullCount>e.count*.5?"high":e.uniqueCount===1?"low":t==="number"&&e.stdDev>e.mean?"high":"medium"}async function zs(e,t,s,n){console.log(`Generating visualizations for dataset ${e}`);const a=await n.prepare(`
    SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
  `).bind(e).all(),r=new Map;a.results.forEach(l=>{r.set(l.id_column,l.name_column)});let i=0;const c=[...s].sort((l,o)=>(o.quality_score||50)-(l.quality_score||50));for(const l of c){if((l.quality_score||50)<30){console.log(`Skipping low-quality visualization for ${l.column_name} (score: ${l.quality_score})`);continue}const o=await Us(l,t,r);o&&await n.prepare(`
        INSERT INTO visualizations (dataset_id, analysis_id, chart_type, title, config, explanation, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(e,l.id,o.chartType,o.title,JSON.stringify(o.config),o.explanation,i++).run()}console.log(`Generated ${i} visualizations`)}function Us(e,t,s){switch(e.analysis_type){case"statistics":return Ws(e,t,s);case"correlation":return Js(e,t,s);case"outlier":return Vs(e,t,s);case"pattern":return Ks(e,t,s);case"trend":return Gs(e,t,s);default:return null}}function Ws(e,t,s){const n=e.column_name;if(!n)return null;const a=e.result,r=s.has(n)?` (via ${s.get(n)})`:"";if(a.mean!==void 0){const o=t.map(m=>Number(m[n])).filter(m=>!isNaN(m)),h=Ys(o);return{chartType:"bar",title:`Distribution: ${n}${r}`,explanation:`This histogram shows how values in "${n}" are distributed${r?" using human-readable names":""}. Taller bars mean more data points at that value range.`,config:{type:"bar",data:{labels:h.labels,datasets:[{label:"Frequency",data:h.data,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`${n} Distribution`}},scales:{y:{beginAtZero:!0,title:{display:!0,text:"Count"}},x:{title:{display:!0,text:n}}}}}}}const i=t.map(o=>o[n]).filter(o=>o!=null),c={};i.forEach(o=>{c[String(o)]=(c[String(o)]||0)+1});const l=Object.entries(c).sort((o,h)=>h[1]-o[1]).slice(0,10);return{chartType:"bar",title:`Top Values: ${n}${r}`,explanation:`This chart shows the most common values in "${n}"${r?" using human-readable names":""}. The tallest bar is the most frequent value.`,config:{type:"bar",data:{labels:l.map(([o])=>o),datasets:[{label:"Count",data:l.map(([,o])=>o),backgroundColor:"rgba(16, 185, 129, 0.6)",borderColor:"rgba(16, 185, 129, 1)",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,indexAxis:"y",plugins:{legend:{display:!1},title:{display:!0,text:`Most Common: ${n}`}},scales:{x:{beginAtZero:!0,title:{display:!0,text:"Count"}}}}}}}function Js(e,t,s){const n=e.result,a=n.column1,r=n.column2;if(!a||!r)return null;const i=s.has(a)?` (via ${s.get(a)})`:"",c=s.has(r)?` (via ${s.get(r)})`:"",l=t.map(m=>({x:Number(m[a]),y:Number(m[r])})).filter(m=>!isNaN(m.x)&&!isNaN(m.y)),o=n.correlation,h=o>0?"rgba(139, 92, 246, 0.6)":"rgba(239, 68, 68, 0.6)";return{chartType:"scatter",title:`Relationship: ${a}${i} vs ${r}${c}`,explanation:`Each dot represents one record${i||c?" using human-readable names":""}. ${o>0?"The upward pattern shows they move together.":"The downward pattern shows they move in opposite directions."}`,config:{type:"scatter",data:{datasets:[{label:`${a} vs ${r}`,data:l,backgroundColor:h,borderColor:h.replace("0.6","1"),borderWidth:1,pointRadius:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`Correlation: ${o.toFixed(2)}`}},scales:{x:{title:{display:!0,text:a}},y:{title:{display:!0,text:r}}}}}}}function Vs(e,t,s){const n=e.column_name;if(!n)return null;const a=s.has(n)?` (via ${s.get(n)})`:"",r=new Set(e.result.indices||[]),i=t.map((o,h)=>({x:h,y:Number(o[n]),isOutlier:r.has(h)})).filter(o=>!isNaN(o.y)),c=i.filter(o=>!o.isOutlier),l=i.filter(o=>o.isOutlier);return{chartType:"scatter",title:`Outliers: ${n}${a}`,explanation:`Red dots are unusual values that stand out from the pattern${a?" (using human-readable names)":""}. Blue dots are normal values.`,config:{type:"scatter",data:{datasets:[{label:"Normal",data:c,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1,pointRadius:3},{label:"Outliers",data:l,backgroundColor:"rgba(239, 68, 68, 0.8)",borderColor:"rgba(239, 68, 68, 1)",borderWidth:2,pointRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"top"},title:{display:!0,text:`${n} - Outlier Detection`}},scales:{x:{title:{display:!0,text:"Record Index"}},y:{title:{display:!0,text:n}}}}}}}function Ks(e,t,s){const n=e.column_name;if(!n)return null;const a=s.has(n)?` (via ${s.get(n)})`:"",r=e.result.topPatterns||[];if(r.length===0)return null;const i=r.slice(0,8);return{chartType:"pie",title:`Pattern Distribution: ${n}${a}`,explanation:`Each slice shows what percentage of records have that value${a?" using human-readable names":""}. Bigger slices are more common.`,config:{type:"pie",data:{labels:i.map(([c])=>c),datasets:[{data:i.map(([,c])=>c),backgroundColor:["rgba(59, 130, 246, 0.8)","rgba(16, 185, 129, 0.8)","rgba(245, 158, 11, 0.8)","rgba(239, 68, 68, 0.8)","rgba(139, 92, 246, 0.8)","rgba(236, 72, 153, 0.8)","rgba(14, 165, 233, 0.8)","rgba(34, 197, 94, 0.8)"],borderWidth:2,borderColor:"#fff"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"right"},title:{display:!0,text:`${n} Breakdown`}}}}}}function Gs(e,t,s){const n=e.column_name;if(!n)return null;const a=s.has(n)?` (via ${s.get(n)})`:"",r=t.map(l=>Number(l[n])).filter(l=>!isNaN(l)),i=e.result,c=i.direction==="up"?"rgba(16, 185, 129, 0.6)":"rgba(239, 68, 68, 0.6)";return{chartType:"line",title:`Trend: ${n}${a}`,explanation:`This line shows how "${n}" changes over time${a?" using human-readable names":""}. ${i.direction==="up"?"The upward slope indicates growth.":"The downward slope indicates decline."}`,config:{type:"line",data:{labels:r.map((l,o)=>`#${o+1}`),datasets:[{label:n,data:r,backgroundColor:c,borderColor:c.replace("0.6","1"),borderWidth:2,fill:!1,tension:.3}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`${n} Over Time (${i.direction==="up"?"↗":"↘"} ${Math.round(i.strength*100)}% strength)`}},scales:{x:{title:{display:!0,text:"Record Number"}},y:{title:{display:!0,text:n}}}}}}}function Ys(e,t=10){if(e.length===0)return{labels:[],data:[]};const s=Math.min(...e),r=(Math.max(...e)-s)/t,i=new Array(t).fill(0),c=[];for(let l=0;l<t;l++){const o=s+l*r,h=s+(l+1)*r;c.push(`${o.toFixed(1)}-${h.toFixed(1)}`)}return e.forEach(l=>{let o=Math.floor((l-s)/r);o>=t&&(o=t-1),o<0&&(o=0),i[o]++}),{labels:c,data:i}}const wn=new Pe;wn.post("/:id",async e=>{try{const t=Number(e.req.param("id")),s=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!s)return e.json({error:"Dataset not found"},404);let a=(await e.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0
    `).bind(t).all()).results.map(o=>JSON.parse(o.data));const r=JSON.parse(s.columns),i=await e.env.DB.prepare(`
      SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
    `).bind(t).all();if(i.results.length>0){const o=i.results.map(h=>({id_column:h.id_column,name_column:h.name_column,confidence:1}));console.log(`Applying ${o.length} column mappings for human-readable analysis...`),a=Ds(a,o);for(const h of o){const m=r.find(g=>g.name===h.id_column);m&&(m.enriched_by=h.name_column)}}await Ls(t,a,r,e.env.DB);const l=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(t).all()).results.map(o=>({...o,result:JSON.parse(o.result)}));return await zs(t,a,l,e.env.DB),await e.env.DB.prepare(`
      UPDATE datasets SET analysis_status = ?, visualization_status = ?
      WHERE id = ?
    `).bind("complete","complete",t).run(),e.json({success:!0,message:"Analysis complete",analyses_count:l.length,dataset_id:t})}catch(t){return console.error("Analysis error:",t),e.json({error:"Analysis failed: "+t.message},500)}});const xn=new Pe;xn.get("/:id",async e=>{try{const t=e.req.param("id"),s=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!s)return e.json({error:"Dataset not found"},404);const n=JSON.parse(s.columns),r=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(t).all()).results.map(g=>({...g,result:JSON.parse(g.result)})),i=[],c=[],l=new Map;for(const g of n){const _=`col_${g.name}`;if(!l.has(_)){const w=10+g.unique_count/s.row_count*30;i.push({id:_,label:g.name,type:"column",size:w}),l.set(_,!0)}}const o=r.filter(g=>g.analysis_type==="correlation"),h=o.sort((g,_)=>Math.abs(_.result.correlation)-Math.abs(g.result.correlation)).slice(0,Math.min(50,o.length));for(const g of h){const{column1:_,column2:v,correlation:w}=g.result,D=`col_${_}`,P=`col_${v}`;n.length>50&&Math.abs(w)<.7||c.push({source:D,target:P,type:"correlation",strength:Math.abs(w),label:`${w>0?"+":""}${w.toFixed(2)}`})}const m=r.filter(g=>g.analysis_type==="pattern"&&(g.quality_score||0)>50);for(const g of m){const _=g.column_name;if(!_)continue;const{topPatterns:v}=g.result;if(!v||v.length===0)continue;const w=v.slice(0,3);for(const[D,P]of w){const Q=`val_${_}_${D}`;l.has(Q)||(i.push({id:Q,label:String(D),type:"value",size:5+P/s.row_count*20}),l.set(Q,!0)),c.push({source:`col_${_}`,target:Q,type:"contains",strength:P/s.row_count,label:`${P}x`})}}return e.json({nodes:i,edges:c,dataset_name:s.name})}catch(t){return console.error("Relationship graph error:",t),e.json({error:"Failed to generate relationship graph"},500)}});const Rt=new Pe;Rt.get("/:datasetId",async e=>{try{const t=e.req.param("datasetId"),s=await e.env.DB.prepare(`
      SELECT * FROM column_mappings WHERE dataset_id = ? ORDER BY id_column
    `).bind(t).all();return e.json({mappings:s.results})}catch(t){return console.error("Mappings fetch error:",t),e.json({error:"Failed to fetch mappings"},500)}});Rt.delete("/:id",async e=>{try{const t=e.req.param("id");return await e.env.DB.prepare(`
      DELETE FROM column_mappings WHERE id = ?
    `).bind(t).run(),e.json({success:!0})}catch(t){return console.error("Mapping delete error:",t),e.json({error:"Failed to delete mapping"},500)}});Rt.post("/",async e=>{try{const{dataset_id:t,id_column:s,name_column:n}=await e.req.json();return await e.env.DB.prepare(`
      INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
      VALUES (?, ?, ?, 0)
    `).bind(t,s,n).run(),e.json({success:!0})}catch(t){return console.error("Mapping create error:",t),e.json({error:"Failed to create mapping"},500)}});var Qs=class{constructor(e,t){E(this,"writer");E(this,"encoder");E(this,"writable");E(this,"abortSubscribers",[]);E(this,"responseReadable");E(this,"aborted",!1);E(this,"closed",!1);this.writable=e,this.writer=e.getWriter(),this.encoder=new TextEncoder;const s=t.getReader();this.abortSubscribers.push(async()=>{await s.cancel()}),this.responseReadable=new ReadableStream({async pull(n){const{done:a,value:r}=await s.read();a?n.close():n.enqueue(r)},cancel:()=>{this.abort()}})}async write(e){try{typeof e=="string"&&(e=this.encoder.encode(e)),await this.writer.write(e)}catch{}return this}async writeln(e){return await this.write(e+`
`),this}sleep(e){return new Promise(t=>setTimeout(t,e))}async close(){try{await this.writer.close()}catch{}this.closed=!0}async pipe(e){this.writer.releaseLock(),await e.pipeTo(this.writable,{preventClose:!0}),this.writer=this.writable.getWriter()}onAbort(e){this.abortSubscribers.push(e)}abort(){this.aborted||(this.aborted=!0,this.abortSubscribers.forEach(e=>e()))}},En=()=>{const e=typeof Bun<"u"?Bun.version:void 0;if(e===void 0)return!1;const t=e.startsWith("1.1")||e.startsWith("1.0")||e.startsWith("0.");return En=()=>t,t},Xs=new WeakMap,Zs=(e,t,s)=>{const{readable:n,writable:a}=new TransformStream,r=new Qs(a,n);return En()&&e.req.raw.signal.addEventListener("abort",()=>{r.closed||r.abort()}),Xs.set(r.responseReadable,e),(async()=>{try{await t(r)}catch(i){i===void 0||console.error(i)}finally{r.close()}})(),e.newResponse(r.responseReadable)};const $t=new Pe,Dt=[{type:"function",function:{name:"get_outlier_columns",description:"Get a list of all columns that have outliers detected, with counts and percentages",parameters:{type:"object",properties:{min_outlier_count:{type:"number",description:"Minimum number of outliers to include (optional, default: 1)"}}}}},{type:"function",function:{name:"get_correlation_analysis",description:"Get correlation analysis between columns, optionally filtered by minimum correlation strength",parameters:{type:"object",properties:{min_correlation:{type:"number",description:"Minimum absolute correlation value to include (0-1, optional, default: 0.5)"},column_name:{type:"string",description:"Specific column to get correlations for (optional)"}}}}},{type:"function",function:{name:"get_column_statistics",description:"Get detailed statistics for a specific column including mean, median, mode, outliers, etc.",parameters:{type:"object",properties:{column_name:{type:"string",description:"Name of the column to analyze"}},required:["column_name"]}}},{type:"function",function:{name:"search_analyses",description:"Search all analyses by type or keyword",parameters:{type:"object",properties:{analysis_type:{type:"string",description:"Type of analysis to filter (outlier, correlation, pattern, summary, etc.)",enum:["outlier","correlation","pattern","summary","missing","distribution"]},keyword:{type:"string",description:"Keyword to search in explanations (optional)"}}}}},{type:"function",function:{name:"get_data_sample",description:"Get a sample of actual data rows from the dataset",parameters:{type:"object",properties:{limit:{type:"number",description:"Number of rows to return (default: 5, max: 20)"},columns:{type:"array",items:{type:"string"},description:"Specific columns to include (optional)"}}}}},{type:"function",function:{name:"get_missing_values",description:"Get information about missing values in the dataset",parameters:{type:"object",properties:{min_missing_percentage:{type:"number",description:"Minimum percentage of missing values to include (optional, default: 0)"}}}}},{type:"function",function:{name:"suggest_data_cleaning",description:"Get data cleaning suggestions for a specific column or the entire dataset",parameters:{type:"object",properties:{column_name:{type:"string",description:"Specific column to analyze (optional, analyzes entire dataset if not provided)"}}}}}];async function Sn(e,t,s){const n=s.min_outlier_count||1,r=(await e.prepare(`
    SELECT column_name, result, explanation, quality_score
    FROM analyses 
    WHERE dataset_id = ? AND analysis_type = 'outlier'
    ORDER BY quality_score DESC
  `).bind(t).all()).results.map(i=>{const c=JSON.parse(i.result);return{column:i.column_name,count:c.count||0,percentage:c.percentage||0,explanation:i.explanation,quality_score:i.quality_score}}).filter(i=>i.count>=n);return{total_columns_with_outliers:r.length,outliers:r}}async function Rn(e,t,s){const n=s.min_correlation||.5,a=s.column_name;let r=`
    SELECT column_name, result, explanation, quality_score
    FROM analyses 
    WHERE dataset_id = ? AND analysis_type = 'correlation'
  `;a&&(r+=` AND column_name LIKE '%${a}%'`),r+=" ORDER BY quality_score DESC";const c=(await e.prepare(r).bind(t).all()).results.map(l=>{const o=JSON.parse(l.result);return{column:l.column_name,correlation:o.correlation||0,target_column:o.target_column||"unknown",explanation:l.explanation,quality_score:l.quality_score}}).filter(l=>Math.abs(l.correlation)>=n);return{total_correlations:c.length,correlations:c}}async function On(e,t,s){const n=s.column_name,a=await e.prepare(`
    SELECT analysis_type, column_name, result, explanation, importance, confidence, quality_score
    FROM analyses 
    WHERE dataset_id = ? AND column_name = ?
    ORDER BY quality_score DESC
  `).bind(t,n).all();if(a.results.length===0)return{error:`No analysis found for column: ${n}`};const r={column:n,analyses:[]};return a.results.forEach(i=>{r.analyses.push({type:i.analysis_type,result:JSON.parse(i.result),explanation:i.explanation,importance:i.importance,confidence:i.confidence,quality_score:i.quality_score})}),r}async function Cn(e,t,s){const n=s.analysis_type,a=s.keyword;let r=`
    SELECT analysis_type, column_name, result, explanation, quality_score
    FROM analyses 
    WHERE dataset_id = ?
  `;const i=[t];n&&(r+=" AND analysis_type = ?",i.push(n)),a&&(r+=" AND explanation LIKE ?",i.push(`%${a}%`)),r+=" ORDER BY quality_score DESC LIMIT 50";const c=await e.prepare(r).bind(...i).all();return{total_found:c.results.length,analyses:c.results.map(l=>({type:l.analysis_type,column:l.column_name,result:JSON.parse(l.result),explanation:l.explanation,quality_score:l.quality_score}))}}async function kn(e,t,s){const n=Math.min(s.limit||5,20),a=s.columns,i=(await e.prepare(`
    SELECT data FROM data_rows 
    WHERE dataset_id = ? 
    ORDER BY row_number 
    LIMIT ?
  `).bind(t,n).all()).results.map(c=>JSON.parse(c.data));return a&&a.length>0?{rows:i.map(c=>{const l={};return a.forEach(o=>{c.hasOwnProperty(o)&&(l[o]=c[o])}),l}),row_count:i.length}:{rows:i,row_count:i.length}}async function Tn(e,t,s){const n=s.min_missing_percentage||0,r=(await e.prepare(`
    SELECT analysis_type, column_name, result, explanation
    FROM analyses 
    WHERE dataset_id = ? AND analysis_type = 'missing'
  `).bind(t).all()).results.map(i=>{const c=JSON.parse(i.result);return{column:i.column_name,count:c.count||0,percentage:c.percentage||0,explanation:i.explanation}}).filter(i=>i.percentage>=n);return{total_columns_with_missing:r.length,missing_values:r}}async function An(e,t,s){const n=s.column_name;let a=`
    SELECT analysis_type, column_name, result, explanation
    FROM analyses 
    WHERE dataset_id = ?
  `;const r=[t];n&&(a+=" AND column_name = ?",r.push(n));const i=await e.prepare(a).bind(...r).all(),c=[];return i.results.forEach(l=>{const o=JSON.parse(l.result),h=l.analysis_type;h==="outlier"&&o.count>0&&c.push({column:l.column_name,issue:"outliers",severity:o.percentage>10?"high":"medium",suggestion:`Remove or cap ${o.count} outlier values (${o.percentage}% of data)`,details:l.explanation}),h==="missing"&&o.count>0&&c.push({column:l.column_name,issue:"missing_values",severity:o.percentage>20?"high":o.percentage>5?"medium":"low",suggestion:`Handle ${o.count} missing values (${o.percentage}%). Consider imputation or removal.`,details:l.explanation}),h==="pattern"&&o.mode_frequency>80&&c.push({column:l.column_name,issue:"low_variance",severity:"low",suggestion:`Column has very low variance (${o.mode_frequency}% same value). Consider removing if not meaningful.`,details:l.explanation})}),{total_suggestions:c.length,suggestions:c.sort((l,o)=>{const h={high:3,medium:2,low:1};return(h[o.severity]||0)-(h[l.severity]||0)})}}$t.post("/:datasetId/stream",async e=>{const t=e.req.param("datasetId"),{message:s,conversationHistory:n=[]}=await e.req.json(),a=e.env.OPENAI_API_KEY;if(!a||a.includes("your-openai-api-key"))return e.json({error:"OpenAI API key not configured",message:"Please configure your OpenAI API key"},500);const r=await e.env.DB.prepare("SELECT * FROM datasets WHERE id = ?").bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);const i=JSON.parse(r.columns),l=[{role:"system",content:`You are a data analysis assistant helping users understand their dataset.

Dataset: ${r.name}
Rows: ${r.row_count}
Columns: ${r.column_count}

Available columns: ${i.slice(0,50).map(o=>o.name).join(", ")}${i.length>50?`, ... and ${i.length-50} more`:""}

You have access to tools to query specific analyses. Use tools to get specific data when asked.`},...n,{role:"user",content:s}];return Zs(e,async o=>{var v,w,D,P,Q;const h=[];let m=[...l];const g=e.env.OPENAI_MODEL||"gpt-4o-mini";for(let ce=0;ce<5;ce++){const B=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${a}`},body:JSON.stringify({model:g,messages:m,tools:Dt,tool_choice:"auto",max_tokens:1500,temperature:.7,stream:!0})});if(!B.ok){await o.write(`data: ${JSON.stringify({error:"OpenAI API error"})}

`);return}const ue=(v=B.body)==null?void 0:v.getReader();if(!ue){await o.write(`data: ${JSON.stringify({error:"No response body"})}

`);return}const G=new TextDecoder;let O="",u=[],d="";for(;;){const{done:f,value:b}=await ue.read();if(f)break;O+=G.decode(b,{stream:!0});const y=O.split(`
`);O=y.pop()||"";for(const S of y)if(S.startsWith("data: ")){const z=S.slice(6);if(z==="[DONE]")continue;try{const W=(D=(w=JSON.parse(z).choices)==null?void 0:w[0])==null?void 0:D.delta;if(W!=null&&W.tool_calls)for(const C of W.tool_calls)u[C.index]||(u[C.index]={id:C.id,type:"function",function:{name:"",arguments:""}}),(P=C.function)!=null&&P.name&&(u[C.index].function.name+=C.function.name),(Q=C.function)!=null&&Q.arguments&&(u[C.index].function.arguments+=C.function.arguments);else W!=null&&W.content&&(d+=W.content,await o.write(`data: ${JSON.stringify({type:"content",content:W.content})}

`))}catch{}}}if(u.length>0){await o.write(`data: ${JSON.stringify({type:"tool_calls_start",count:u.length})}

`),m.push({role:"assistant",content:d||null,tool_calls:u});for(const f of u){const b=f.function.name,y=JSON.parse(f.function.arguments);h.push({name:b,args:y}),await o.write(`data: ${JSON.stringify({type:"tool_call",name:b})}

`);let S;try{switch(b){case"get_outlier_columns":S=await Sn(e.env.DB,t,y);break;case"get_correlation_analysis":S=await Rn(e.env.DB,t,y);break;case"get_column_statistics":S=await On(e.env.DB,t,y);break;case"search_analyses":S=await Cn(e.env.DB,t,y);break;case"get_data_sample":S=await kn(e.env.DB,t,y);break;case"get_missing_values":S=await Tn(e.env.DB,t,y);break;case"suggest_data_cleaning":S=await An(e.env.DB,t,y);break;default:S={error:`Unknown function: ${b}`}}}catch{S={error:`Failed to execute ${b}`}}m.push({role:"tool",tool_call_id:f.id,content:JSON.stringify(S)})}d="";continue}break}await o.write(`data: ${JSON.stringify({type:"tool_calls_complete",tools:h})}

`);const _=Nn(s,[]);await o.write(`data: ${JSON.stringify({type:"suggestions",suggestions:_})}

`),await o.write(`data: ${JSON.stringify({type:"done"})}

`)})});$t.post("/:datasetId",async e=>{var t;try{const s=e.req.param("datasetId"),{message:n,conversationHistory:a=[]}=await e.req.json(),r=e.env.OPENAI_API_KEY;if(!r||r.includes("your-openai-api-key"))return e.json({error:"OpenAI API key not configured",message:ot(n)},500);const i=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(s).first();if(!i)return e.json({error:"Dataset not found"},404);const c=JSON.parse(i.columns),o=[{role:"system",content:`You are a data analysis assistant helping users understand their dataset.

Dataset: ${i.name}
Rows: ${i.row_count}
Columns: ${i.column_count}

Available columns: ${c.slice(0,50).map(w=>w.name).join(", ")}${c.length>50?`, ... and ${c.length-50} more`:""}

You have access to tools to query specific analyses:
- get_outlier_columns: Find columns with outliers
- get_correlation_analysis: Find correlations between columns
- get_column_statistics: Get detailed stats for a specific column
- search_analyses: Search all analyses by type or keyword
- get_data_sample: Get sample rows from the dataset
- get_missing_values: Find columns with missing data
- suggest_data_cleaning: Get data cleaning suggestions

Your role:
- Use tools to get specific data when asked
- Provide concrete answers with actual numbers from the tools
- Be concise but thorough (max 3-4 paragraphs)
- Use bullet points for lists
- Always cite specific results from tool calls

When users ask questions, use the appropriate tools to get actual data.`},...a,{role:"user",content:n}],h=e.env.OPENAI_MODEL||"gpt-4o-mini";console.log(`Calling OpenAI API with model: ${h} and ${Dt.length} tools`);let m="",g=[...o];const _=[];for(let w=0;w<5;w++){const D=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r}`},body:JSON.stringify({model:h,messages:g,tools:Dt,tool_choice:"auto",max_tokens:1500,temperature:.7})}),P=await D.text();if(!D.ok)return console.error("OpenAI API error status:",D.status),console.error("OpenAI API error response:",P),e.json({error:"Failed to get response from OpenAI",message:ot(n)},500);const Q=JSON.parse(P),ce=(t=Q.choices)==null?void 0:t[0];if(!ce)return console.error("No choice in OpenAI response:",Q),e.json({error:"Empty response from OpenAI",message:ot(n)},500);const B=ce.message;if(B.tool_calls&&B.tool_calls.length>0){console.log(`Tool calls requested: ${B.tool_calls.length}`),g.push(B);for(const ue of B.tool_calls){const G=ue.function.name,O=JSON.parse(ue.function.arguments);_.push({name:G,args:O}),console.log(`Executing tool: ${G}`,O);let u;try{switch(G){case"get_outlier_columns":u=await Sn(e.env.DB,s,O);break;case"get_correlation_analysis":u=await Rn(e.env.DB,s,O);break;case"get_column_statistics":u=await On(e.env.DB,s,O);break;case"search_analyses":u=await Cn(e.env.DB,s,O);break;case"get_data_sample":u=await kn(e.env.DB,s,O);break;case"get_missing_values":u=await Tn(e.env.DB,s,O);break;case"suggest_data_cleaning":u=await An(e.env.DB,s,O);break;default:u={error:`Unknown function: ${G}`}}}catch(d){console.error(`Tool execution error for ${G}:`,d),u={error:`Failed to execute ${G}: ${d}`}}g.push({role:"tool",tool_call_id:ue.id,content:JSON.stringify(u)})}continue}m=B.content||"";break}if(!m)return e.json({error:"No final response from OpenAI",message:ot(n)},500);const v=Nn(n,[]);return e.json({message:m,suggestions:v,tool_calls:_})}catch(s){console.error("Chat error:",s);const n=s instanceof Error?s.message:String(s);return e.json({error:"Chat failed: "+n,message:ot("error")},500)}});function Nn(e,t){const s=e.toLowerCase(),n=[];return s.includes("outlier")?(n.push("How should I clean the outliers?"),n.push("Show me correlations between outlier columns")):s.includes("correlat")?(n.push("Which columns have the most outliers?"),n.push("Show me a data sample")):s.includes("clean")?(n.push("Show me missing values"),n.push("What are the biggest data quality issues?")):(n.push("Which columns have outliers?"),n.push("Suggest data cleaning steps"),n.push("Show me the strongest correlations")),n.slice(0,3)}function ot(e){const t=e.toLowerCase();return t.includes("outlier")?"To see outliers, go to the 'Insights' tab and search for 'outlier'.":t.includes("correlat")?"Check the 'Insights' tab and search for 'correlation'.":"I'm currently operating in fallback mode. Please configure your OpenAI API key."}const _e=new Pe;_e.use("/api/*",hs());_e.use("/static/*",xs({root:"./public"}));_e.route("/api/upload",vn);_e.route("/api/datasets",nt);_e.route("/api/analyze",wn);_e.route("/api/relationships",xn);_e.route("/api/mappings",Rt);_e.route("/api/chat",$t);_e.get("/api/health",e=>e.json({status:"ok",timestamp:new Date().toISOString()}));_e.get("/",e=>e.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Data Intelligence Platform</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"><\/script>
        <script src="https://unpkg.com/cytoscape@3.28.1/dist/cytoscape.min.js"><\/script>
        <style>
          :root {
            --bg-primary: #e0e5ec;
            --bg-secondary: #ffffff;
            --text-primary: #2c3e50;
            --text-secondary: #6b7280;
            --accent: #3b82f6;
            --shadow-light: #ffffff;
            --shadow-dark: #a3b1c6;
          }

          [data-theme="dark"] {
            --bg-primary: #1e293b;
            --bg-secondary: #0f172a;
            --text-primary: #f1f5f9;
            --text-secondary: #94a3b8;
            --accent: #60a5fa;
            --shadow-light: #2d3e54;
            --shadow-dark: #0a1120;
          }

          * {
            transition: background-color 0.3s, color 0.3s, box-shadow 0.3s;
          }

          body {
            background: var(--bg-primary);
            color: var(--text-primary);
          }

          /* Neumorphism Styles */
          .neu-card {
            background: var(--bg-primary);
            border-radius: 20px;
            box-shadow: 8px 8px 16px var(--shadow-dark),
                        -8px -8px 16px var(--shadow-light);
          }

          .neu-card-inset {
            background: var(--bg-primary);
            border-radius: 20px;
            box-shadow: inset 8px 8px 16px var(--shadow-dark),
                        inset -8px -8px 16px var(--shadow-light);
          }

          .neu-button {
            background: var(--bg-primary);
            border-radius: 12px;
            box-shadow: 4px 4px 8px var(--shadow-dark),
                        -4px -4px 8px var(--shadow-light);
            border: none;
            padding: 12px 24px;
            cursor: pointer;
            font-weight: 600;
            color: var(--text-primary);
          }

          .neu-button:hover {
            box-shadow: 2px 2px 4px var(--shadow-dark),
                        -2px -2px 4px var(--shadow-light);
          }

          .neu-button:active {
            box-shadow: inset 4px 4px 8px var(--shadow-dark),
                        inset -4px -4px 8px var(--shadow-light);
          }

          .neu-button-accent {
            background: linear-gradient(145deg, var(--accent), #2563eb);
            color: white;
            box-shadow: 4px 4px 8px var(--shadow-dark),
                        -4px -4px 8px var(--shadow-light);
          }

          .upload-area {
            border: 2px dashed var(--text-secondary);
            transition: all 0.3s;
          }

          .upload-area.drag-over {
            border-color: var(--accent);
            background-color: var(--bg-secondary);
          }

          .insight-card {
            animation: slideIn 0.5s ease-out;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Tab Styles */
          .tab-btn {
            background: var(--bg-primary);
            border-radius: 12px;
            padding: 12px 24px;
            cursor: pointer;
            font-weight: 600;
            color: var(--text-primary);
            box-shadow: 4px 4px 8px var(--shadow-dark),
                        -4px -4px 8px var(--shadow-light);
          }

          .tab-btn.active {
            background: linear-gradient(145deg, var(--accent), #2563eb);
            color: white;
            box-shadow: inset 4px 4px 8px rgba(0,0,0,0.2),
                        inset -4px -4px 8px rgba(255,255,255,0.1);
          }

          /* Dark mode toggle */
          .theme-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
          }

          /* Print styles */
          @media print {
            body { background: white; }
            .no-print { display: none !important; }
            .neu-card { box-shadow: none; border: 1px solid #e5e7eb; }
          }
        </style>
    </head>
    <body>
        <!-- Theme Toggle -->
        <button onclick="toggleTheme()" class="theme-toggle neu-button">
            <i id="theme-icon" class="fas fa-moon"></i>
        </button>

        <div class="min-h-screen p-8">
            <!-- Header -->
            <header class="neu-card p-6 mb-8 no-print">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold">
                            <i class="fas fa-brain mr-3" style="color: var(--accent);"></i>
                            Data Intelligence Platform
                        </h1>
                        <p class="text-sm mt-2" style="color: var(--text-secondary);">
                            Upload → Analyze → Understand. Automated insights from your data.
                        </p>
                    </div>
                    <button id="view-datasets" class="neu-button">
                        <i class="fas fa-database mr-2"></i>My Datasets
                    </button>
                </div>
            </header>

            <!-- Main Content -->
            <main>
                <!-- Upload Section -->
                <div id="upload-section" class="mb-8">
                    <div class="neu-card p-8">
                        <h2 class="text-2xl font-bold mb-4">
                            <i class="fas fa-upload mr-2" style="color: var(--accent);"></i>
                            Upload Your Data
                        </h2>
                        <p class="mb-6" style="color: var(--text-secondary);">
                            Drop a CSV or JSON file below and we'll automatically analyze it, find patterns, 
                            and explain what matters in plain English.
                        </p>

                        <div id="upload-area" class="upload-area neu-card-inset rounded-lg p-12 text-center cursor-pointer">
                            <input type="file" id="file-input" accept=".csv,.json" class="hidden">
                            <div id="upload-prompt">
                                <i class="fas fa-cloud-upload-alt text-6xl mb-4" style="color: var(--text-secondary);"></i>
                                <p class="text-xl mb-2">Drop your file here or click to browse</p>
                                <p class="text-sm" style="color: var(--text-secondary);">Supports CSV and JSON files</p>
                            </div>
                            <div id="upload-progress" class="hidden">
                                <i class="fas fa-spinner fa-spin text-4xl mb-4" style="color: var(--accent);"></i>
                                <p id="status-message" class="text-lg font-semibold">Uploading...</p>
                                <p id="status-detail" class="text-sm mt-2" style="color: var(--text-secondary);"></p>
                                <div class="mt-4 w-64 mx-auto neu-card-inset rounded-full h-3">
                                    <div id="progress-bar" class="h-3 rounded-full transition-all duration-300" 
                                         style="width: 0%; background: linear-gradient(90deg, var(--accent), #2563eb);"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Results Section -->
                <div id="results-section" class="hidden">
                    <!-- Export Actions -->
                    <div class="mb-6 flex justify-between items-center no-print">
                        <div class="flex gap-3">
                            <button id="tab-insights" onclick="switchTab('insights')" class="tab-btn active">
                                <i class="fas fa-lightbulb mr-2"></i>Insights
                            </button>
                            <button id="tab-relationships" onclick="switchTab('relationships')" class="tab-btn">
                                <i class="fas fa-project-diagram mr-2"></i>Relationships
                            </button>
                            <button id="tab-mappings" onclick="switchTab('mappings')" class="tab-btn">
                                <i class="fas fa-link mr-2"></i>Column Mappings
                            </button>
                        </div>
                        <div class="flex gap-3">
                            <button onclick="window.print()" class="neu-button-accent">
                                <i class="fas fa-file-pdf mr-2"></i>Export PDF
                            </button>
                            <button onclick="showSection('upload')" class="neu-button">
                                <i class="fas fa-plus mr-2"></i>New Analysis
                            </button>
                        </div>
                    </div>

                    <!-- Dataset Info -->
                    <div class="neu-card p-6 mb-6">
                        <h2 class="text-2xl font-bold mb-4">
                            <i class="fas fa-info-circle mr-2" style="color: var(--accent);"></i>
                            Dataset Overview
                        </h2>
                        <div id="dataset-info" class="grid grid-cols-1 md:grid-cols-4 gap-4"></div>
                    </div>

                    <!-- Insights Tab -->
                    <div id="tab-content-insights">
                        <!-- Search and Filter Bar -->
                        <div class="neu-card p-4 mb-6 no-print">
                            <div class="flex gap-3 items-center">
                                <div class="flex-1 neu-card-inset rounded-lg p-2 flex items-center">
                                    <i class="fas fa-search mx-3" style="color: var(--text-secondary);"></i>
                                    <input type="text" id="insight-search" 
                                           placeholder="Search insights, columns, patterns..." 
                                           onkeyup="debouncedSearch(this.value)"
                                           class="flex-1 bg-transparent border-none outline-none"
                                           style="color: var(--text-primary);">
                                </div>
                                <button onclick="showBookmarked()" class="neu-button" title="Show Bookmarked">
                                    <i class="fas fa-star mr-2" style="color: #f59e0b;"></i>Bookmarked
                                </button>
                                <button onclick="filterInsights('')" class="neu-button" title="Clear Filters">
                                    <i class="fas fa-redo mr-2"></i>Reset
                                </button>
                            </div>
                            <p id="search-result-count" class="text-sm mt-2" style="color: var(--text-secondary);"></p>
                        </div>

                        <!-- Visualizations -->
                        <div class="neu-card p-6 mb-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-chart-line mr-2" style="color: #a855f7;"></i>
                                Visual Insights
                            </h2>
                            <div id="visualizations-container" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
                        </div>

                        <!-- Key Insights -->
                        <div class="neu-card p-6 mb-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-lightbulb mr-2" style="color: #f59e0b;"></i>
                                Key Insights
                            </h2>
                            <div id="insights-container" class="space-y-4"></div>
                        </div>

                        <!-- Sample Data -->
                        <div class="neu-card p-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-table mr-2" style="color: #10b981;"></i>
                                Sample Data
                            </h2>
                            <div id="sample-data" class="overflow-x-auto"></div>
                        </div>
                    </div>

                    <!-- Relationships Tab -->
                    <div id="tab-content-relationships" class="hidden">
                        <div class="neu-card p-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-project-diagram mr-2" style="color: #a855f7;"></i>
                                Interactive Relationship Graph
                            </h2>
                            <p class="mb-4" style="color: var(--text-secondary);">
                                This graph shows how columns relate to each other. Click and drag to explore. 
                                Thicker lines mean stronger relationships.
                            </p>
                            <div id="graph-container" class="neu-card-inset rounded-lg p-4" style="height: 600px;"></div>
                        </div>
                    </div>

                    <!-- Mappings Tab -->
                    <div id="tab-content-mappings" class="hidden">
                        <div class="neu-card p-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-link mr-2" style="color: #3b82f6;"></i>
                                Column Mappings
                            </h2>
                            <p class="mb-4" style="color: var(--text-secondary);">
                                These mappings tell the system how to replace ID columns with human-readable names in visualizations.
                                Auto-detected mappings are marked with a green badge.
                            </p>
                            <div id="mappings-container"></div>
                        </div>
                    </div>
                </div>

                <!-- Datasets List -->
                <div id="datasets-section" class="hidden">
                    <div class="neu-card p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold">
                                <i class="fas fa-database mr-2" style="color: var(--accent);"></i>
                                Your Datasets
                            </h2>
                            <button id="back-to-upload" class="neu-button-accent">
                                <i class="fas fa-plus mr-2"></i>New Upload
                            </button>
                        </div>
                        <div id="datasets-list"></div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Chat Widget -->
        <div id="chat-widget" class="hidden fixed bottom-20 right-8 w-96 h-[32rem] neu-card flex flex-col no-print" style="z-index: 1000;">
            <div class="p-4 border-b flex items-center justify-between" style="border-color: var(--shadow-dark);">
                <div class="flex items-center gap-2">
                    <i class="fas fa-brain" style="color: var(--accent);"></i>
                    <h3 class="font-semibold" style="color: var(--text-primary);">Data Assistant</h3>
                </div>
                <button onclick="clearChat()" class="neu-button p-2" title="Clear Chat">
                    <i class="fas fa-redo text-sm"></i>
                </button>
            </div>
            <div id="chat-messages" class="flex-1 overflow-y-auto p-4" style="background: var(--bg-primary);">
                <div class="flex items-start gap-3 mb-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--accent); color: white;">
                        <i class="fas fa-brain text-sm"></i>
                    </div>
                    <div class="neu-card px-4 py-2 max-w-[80%]" style="color: var(--text-primary);">
                        <p class="mb-3">👋 Hi! I'm your data analysis assistant. I can help you understand patterns, correlations, and insights in your data.</p>
                        <p class="text-sm" style="color: var(--text-secondary);">💡 <strong>Tip:</strong> To enable AI-powered responses, add your OpenAI API key to <code>.dev.vars</code> file. See <a href="https://github.com/yourusername/webapp/blob/main/OPENAI_SETUP.md" target="_blank" class="underline" style="color: var(--accent);">OPENAI_SETUP.md</a> for instructions.</p>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t flex gap-2" style="border-color: var(--shadow-dark);">
                <input type="text" id="chat-input" 
                       placeholder="Ask about your data..." 
                       class="flex-1 neu-card-inset rounded-lg px-4 py-2 bg-transparent border-none outline-none"
                       style="color: var(--text-primary);">
                <button onclick="sendChatMessage()" class="neu-button-accent px-4 py-2">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>

        <!-- Chat Toggle Button -->
        <button id="chat-toggle-btn" onclick="toggleChat()" 
                class="fixed bottom-8 right-8 w-14 h-14 neu-button-accent rounded-full flex items-center justify-center no-print"
                style="z-index: 999;">
            <i class="fas fa-comments text-xl"></i>
        </button>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script>
          // Theme management
          function toggleTheme() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const icon = document.getElementById('theme-icon');
            icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
          }

          // Load saved theme
          window.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            const icon = document.getElementById('theme-icon');
            icon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
          });
        <\/script>
        <script src="/static/app.js"><\/script>
        <script src="/static/graph.js"><\/script>
        <script src="/static/chat.js"><\/script>
    </body>
    </html>
  `));const Wt=new Pe,er=Object.assign({"/src/index.tsx":_e});let Dn=!1;for(const[,e]of Object.entries(er))e&&(Wt.all("*",t=>{let s;try{s=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,s)}),Wt.notFound(t=>{let s;try{s=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,s)}),Dn=!0);if(!Dn)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{Wt as default};
