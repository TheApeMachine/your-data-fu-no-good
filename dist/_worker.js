var Rn=Object.defineProperty;var It=e=>{throw TypeError(e)};var Sn=(e,t,s)=>t in e?Rn(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;var R=(e,t,s)=>Sn(e,typeof t!="symbol"?t+"":t,s),Ot=(e,t,s)=>t.has(e)||It("Cannot "+s);var p=(e,t,s)=>(Ot(e,t,"read from private field"),s?s.call(e):t.get(e)),A=(e,t,s)=>t.has(e)?It("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),E=(e,t,s,n)=>(Ot(e,t,"write to private field"),n?n.call(e,s):t.set(e,s),s),P=(e,t,s)=>(Ot(e,t,"access private method"),s);var Mt=(e,t,s,n)=>({set _(a){E(e,t,a,s)},get _(){return p(e,t,n)}});var qt=(e,t,s)=>(n,a)=>{let r=-1;return i(0);async function i(c){if(c<=r)throw new Error("next() called multiple times");r=c;let l,o=!1,h;if(e[c]?(h=e[c][0][0],n.req.routeIndex=c):h=c===e.length&&a||void 0,h)try{l=await h(n,()=>i(c+1))}catch(f){if(f instanceof Error&&t)n.error=f,l=await t(f,n),o=!0;else throw f}else n.finalized===!1&&s&&(l=await s(n));return l&&(n.finalized===!1||o)&&(n.res=l),n}},Cn=Symbol(),On=async(e,t=Object.create(null))=>{const{all:s=!1,dot:n=!1}=t,r=(e instanceof an?e.raw.headers:e.headers).get("Content-Type");return r!=null&&r.startsWith("multipart/form-data")||r!=null&&r.startsWith("application/x-www-form-urlencoded")?kn(e,{all:s,dot:n}):{}};async function kn(e,t){const s=await e.formData();return s?Tn(s,t):{}}function Tn(e,t){const s=Object.create(null);return e.forEach((n,a)=>{t.all||a.endsWith("[]")?An(s,a,n):s[a]=n}),t.dot&&Object.entries(s).forEach(([n,a])=>{n.includes(".")&&(Nn(s,n,a),delete s[n])}),s}var An=(e,t,s)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(s):e[t]=[e[t],s]:t.endsWith("[]")?e[t]=[s]:e[t]=s},Nn=(e,t,s)=>{let n=e;const a=t.split(".");a.forEach((r,i)=>{i===a.length-1?n[r]=s:((!n[r]||typeof n[r]!="object"||Array.isArray(n[r])||n[r]instanceof File)&&(n[r]=Object.create(null)),n=n[r])})},en=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},Dn=e=>{const{groups:t,path:s}=jn(e),n=en(s);return $n(n,t)},jn=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(s,n)=>{const a=`@${n}`;return t.push([a,s]),a}),{groups:t,path:e}},$n=(e,t)=>{for(let s=t.length-1;s>=0;s--){const[n]=t[s];for(let a=e.length-1;a>=0;a--)if(e[a].includes(n)){e[a]=e[a].replace(n,t[s][1]);break}}return e},yt={},In=(e,t)=>{if(e==="*")return"*";const s=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(s){const n=`${e}#${t}`;return yt[n]||(s[2]?yt[n]=t&&t[0]!==":"&&t[0]!=="*"?[n,s[1],new RegExp(`^${s[2]}(?=/${t})`)]:[e,s[1],new RegExp(`^${s[2]}$`)]:yt[n]=[e,s[1],!0]),yt[n]}return null},Dt=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,s=>{try{return t(s)}catch{return s}})}},Mn=e=>Dt(e,decodeURI),tn=e=>{const t=e.url,s=t.indexOf("/",t.indexOf(":")+4);let n=s;for(;n<t.length;n++){const a=t.charCodeAt(n);if(a===37){const r=t.indexOf("?",n),i=t.slice(s,r===-1?void 0:r);return Mn(i.includes("%25")?i.replace(/%25/g,"%2525"):i)}else if(a===63)break}return t.slice(s,n)},qn=e=>{const t=tn(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},Ke=(e,t,...s)=>(s.length&&(t=Ke(t,...s)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),nn=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),s=[];let n="";return t.forEach(a=>{if(a!==""&&!/\:/.test(a))n+="/"+a;else if(/\:/.test(a))if(/\?/.test(a)){s.length===0&&n===""?s.push("/"):s.push(n);const r=a.replace("?","");n+="/"+r,s.push(n)}else n+="/"+a}),s.filter((a,r,i)=>i.indexOf(a)===r)},kt=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?Dt(e,rn):e):e,sn=(e,t,s)=>{let n;if(!s&&t&&!/[%+]/.test(t)){let i=e.indexOf(`?${t}`,8);for(i===-1&&(i=e.indexOf(`&${t}`,8));i!==-1;){const c=e.charCodeAt(i+t.length+1);if(c===61){const l=i+t.length+2,o=e.indexOf("&",l);return kt(e.slice(l,o===-1?void 0:o))}else if(c==38||isNaN(c))return"";i=e.indexOf(`&${t}`,i+1)}if(n=/[%+]/.test(e),!n)return}const a={};n??(n=/[%+]/.test(e));let r=e.indexOf("?",8);for(;r!==-1;){const i=e.indexOf("&",r+1);let c=e.indexOf("=",r);c>i&&i!==-1&&(c=-1);let l=e.slice(r+1,c===-1?i===-1?void 0:i:c);if(n&&(l=kt(l)),r=i,l==="")continue;let o;c===-1?o="":(o=e.slice(c+1,i===-1?void 0:i),n&&(o=kt(o))),s?(a[l]&&Array.isArray(a[l])||(a[l]=[]),a[l].push(o)):a[l]??(a[l]=o)}return t?a[t]:a},Pn=sn,Ln=(e,t)=>sn(e,t,!0),rn=decodeURIComponent,Pt=e=>Dt(e,rn),Qe,he,ke,on,ln,At,Ae,Wt,an=(Wt=class{constructor(e,t="/",s=[[]]){A(this,ke);R(this,"raw");A(this,Qe);A(this,he);R(this,"routeIndex",0);R(this,"path");R(this,"bodyCache",{});A(this,Ae,e=>{const{bodyCache:t,raw:s}=this,n=t[e];if(n)return n;const a=Object.keys(t)[0];return a?t[a].then(r=>(a==="json"&&(r=JSON.stringify(r)),new Response(r)[e]())):t[e]=s[e]()});this.raw=e,this.path=t,E(this,he,s),E(this,Qe,{})}param(e){return e?P(this,ke,on).call(this,e):P(this,ke,ln).call(this)}query(e){return Pn(this.url,e)}queries(e){return Ln(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((s,n)=>{t[n]=s}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await On(this,e))}json(){return p(this,Ae).call(this,"text").then(e=>JSON.parse(e))}text(){return p(this,Ae).call(this,"text")}arrayBuffer(){return p(this,Ae).call(this,"arrayBuffer")}blob(){return p(this,Ae).call(this,"blob")}formData(){return p(this,Ae).call(this,"formData")}addValidatedData(e,t){p(this,Qe)[e]=t}valid(e){return p(this,Qe)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Cn](){return p(this,he)}get matchedRoutes(){return p(this,he)[0].map(([[,e]])=>e)}get routePath(){return p(this,he)[0].map(([[,e]])=>e)[this.routeIndex].path}},Qe=new WeakMap,he=new WeakMap,ke=new WeakSet,on=function(e){const t=p(this,he)[0][this.routeIndex][1][e],s=P(this,ke,At).call(this,t);return s&&/\%/.test(s)?Pt(s):s},ln=function(){const e={},t=Object.keys(p(this,he)[0][this.routeIndex][1]);for(const s of t){const n=P(this,ke,At).call(this,p(this,he)[0][this.routeIndex][1][s]);n!==void 0&&(e[s]=/\%/.test(n)?Pt(n):n)}return e},At=function(e){return p(this,he)[1]?p(this,he)[1][e]:e},Ae=new WeakMap,Wt),Fn={Stringify:1},cn=async(e,t,s,n,a)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const r=e.callbacks;return r!=null&&r.length?(a?a[0]+=e:a=[e],Promise.all(r.map(c=>c({phase:t,buffer:a,context:n}))).then(c=>Promise.all(c.filter(Boolean).map(l=>cn(l,t,!1,n,a))).then(()=>a[0]))):Promise.resolve(e)},Hn="text/plain; charset=UTF-8",Tt=(e,t)=>({"Content-Type":e,...t}),dt,ht,Re,Xe,Se,oe,pt,Ze,et,Fe,ft,mt,Ne,Ge,Jt,zn=(Jt=class{constructor(e,t){A(this,Ne);A(this,dt);A(this,ht);R(this,"env",{});A(this,Re);R(this,"finalized",!1);R(this,"error");A(this,Xe);A(this,Se);A(this,oe);A(this,pt);A(this,Ze);A(this,et);A(this,Fe);A(this,ft);A(this,mt);R(this,"render",(...e)=>(p(this,Ze)??E(this,Ze,t=>this.html(t)),p(this,Ze).call(this,...e)));R(this,"setLayout",e=>E(this,pt,e));R(this,"getLayout",()=>p(this,pt));R(this,"setRenderer",e=>{E(this,Ze,e)});R(this,"header",(e,t,s)=>{this.finalized&&E(this,oe,new Response(p(this,oe).body,p(this,oe)));const n=p(this,oe)?p(this,oe).headers:p(this,Fe)??E(this,Fe,new Headers);t===void 0?n.delete(e):s!=null&&s.append?n.append(e,t):n.set(e,t)});R(this,"status",e=>{E(this,Xe,e)});R(this,"set",(e,t)=>{p(this,Re)??E(this,Re,new Map),p(this,Re).set(e,t)});R(this,"get",e=>p(this,Re)?p(this,Re).get(e):void 0);R(this,"newResponse",(...e)=>P(this,Ne,Ge).call(this,...e));R(this,"body",(e,t,s)=>P(this,Ne,Ge).call(this,e,t,s));R(this,"text",(e,t,s)=>!p(this,Fe)&&!p(this,Xe)&&!t&&!s&&!this.finalized?new Response(e):P(this,Ne,Ge).call(this,e,t,Tt(Hn,s)));R(this,"json",(e,t,s)=>P(this,Ne,Ge).call(this,JSON.stringify(e),t,Tt("application/json",s)));R(this,"html",(e,t,s)=>{const n=a=>P(this,Ne,Ge).call(this,a,t,Tt("text/html; charset=UTF-8",s));return typeof e=="object"?cn(e,Fn.Stringify,!1,{}).then(n):n(e)});R(this,"redirect",(e,t)=>{const s=String(e);return this.header("Location",/[^\x00-\xFF]/.test(s)?encodeURI(s):s),this.newResponse(null,t??302)});R(this,"notFound",()=>(p(this,et)??E(this,et,()=>new Response),p(this,et).call(this,this)));E(this,dt,e),t&&(E(this,Se,t.executionCtx),this.env=t.env,E(this,et,t.notFoundHandler),E(this,mt,t.path),E(this,ft,t.matchResult))}get req(){return p(this,ht)??E(this,ht,new an(p(this,dt),p(this,mt),p(this,ft))),p(this,ht)}get event(){if(p(this,Se)&&"respondWith"in p(this,Se))return p(this,Se);throw Error("This context has no FetchEvent")}get executionCtx(){if(p(this,Se))return p(this,Se);throw Error("This context has no ExecutionContext")}get res(){return p(this,oe)||E(this,oe,new Response(null,{headers:p(this,Fe)??E(this,Fe,new Headers)}))}set res(e){if(p(this,oe)&&e){e=new Response(e.body,e);for(const[t,s]of p(this,oe).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const n=p(this,oe).headers.getSetCookie();e.headers.delete("set-cookie");for(const a of n)e.headers.append("set-cookie",a)}else e.headers.set(t,s)}E(this,oe,e),this.finalized=!0}get var(){return p(this,Re)?Object.fromEntries(p(this,Re)):{}}},dt=new WeakMap,ht=new WeakMap,Re=new WeakMap,Xe=new WeakMap,Se=new WeakMap,oe=new WeakMap,pt=new WeakMap,Ze=new WeakMap,et=new WeakMap,Fe=new WeakMap,ft=new WeakMap,mt=new WeakMap,Ne=new WeakSet,Ge=function(e,t,s){const n=p(this,oe)?new Headers(p(this,oe).headers):p(this,Fe)??new Headers;if(typeof t=="object"&&"headers"in t){const r=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[i,c]of r)i.toLowerCase()==="set-cookie"?n.append(i,c):n.set(i,c)}if(s)for(const[r,i]of Object.entries(s))if(typeof i=="string")n.set(r,i);else{n.delete(r);for(const c of i)n.append(r,c)}const a=typeof t=="number"?t:(t==null?void 0:t.status)??p(this,Xe);return new Response(e,{status:a,headers:n})},Jt),Q="ALL",Bn="all",Un=["get","post","put","delete","options","patch"],un="Can not add a route since the matcher is already built.",dn=class extends Error{},Wn="__COMPOSED_HANDLER",Jn=e=>e.text("404 Not Found",404),Lt=(e,t)=>{if("getResponse"in e){const s=e.getResponse();return t.newResponse(s.body,s)}return console.error(e),t.text("Internal Server Error",500)},ge,X,pn,ye,Pe,bt,vt,Vt,hn=(Vt=class{constructor(t={}){A(this,X);R(this,"get");R(this,"post");R(this,"put");R(this,"delete");R(this,"options");R(this,"patch");R(this,"all");R(this,"on");R(this,"use");R(this,"router");R(this,"getPath");R(this,"_basePath","/");A(this,ge,"/");R(this,"routes",[]);A(this,ye,Jn);R(this,"errorHandler",Lt);R(this,"onError",t=>(this.errorHandler=t,this));R(this,"notFound",t=>(E(this,ye,t),this));R(this,"fetch",(t,...s)=>P(this,X,vt).call(this,t,s[1],s[0],t.method));R(this,"request",(t,s,n,a)=>t instanceof Request?this.fetch(s?new Request(t,s):t,n,a):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${Ke("/",t)}`,s),n,a)));R(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(P(this,X,vt).call(this,t.request,t,void 0,t.request.method))})});[...Un,Bn].forEach(r=>{this[r]=(i,...c)=>(typeof i=="string"?E(this,ge,i):P(this,X,Pe).call(this,r,p(this,ge),i),c.forEach(l=>{P(this,X,Pe).call(this,r,p(this,ge),l)}),this)}),this.on=(r,i,...c)=>{for(const l of[i].flat()){E(this,ge,l);for(const o of[r].flat())c.map(h=>{P(this,X,Pe).call(this,o.toUpperCase(),p(this,ge),h)})}return this},this.use=(r,...i)=>(typeof r=="string"?E(this,ge,r):(E(this,ge,"*"),i.unshift(r)),i.forEach(c=>{P(this,X,Pe).call(this,Q,p(this,ge),c)}),this);const{strict:n,...a}=t;Object.assign(this,a),this.getPath=n??!0?t.getPath??tn:qn}route(t,s){const n=this.basePath(t);return s.routes.map(a=>{var i;let r;s.errorHandler===Lt?r=a.handler:(r=async(c,l)=>(await qt([],s.errorHandler)(c,()=>a.handler(c,l))).res,r[Wn]=a.handler),P(i=n,X,Pe).call(i,a.method,a.path,r)}),this}basePath(t){const s=P(this,X,pn).call(this);return s._basePath=Ke(this._basePath,t),s}mount(t,s,n){let a,r;n&&(typeof n=="function"?r=n:(r=n.optionHandler,n.replaceRequest===!1?a=l=>l:a=n.replaceRequest));const i=r?l=>{const o=r(l);return Array.isArray(o)?o:[o]}:l=>{let o;try{o=l.executionCtx}catch{}return[l.env,o]};a||(a=(()=>{const l=Ke(this._basePath,t),o=l==="/"?0:l.length;return h=>{const f=new URL(h.url);return f.pathname=f.pathname.slice(o)||"/",new Request(f,h)}})());const c=async(l,o)=>{const h=await s(a(l.req.raw),...i(l));if(h)return h;await o()};return P(this,X,Pe).call(this,Q,Ke(t,"*"),c),this}},ge=new WeakMap,X=new WeakSet,pn=function(){const t=new hn({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,E(t,ye,p(this,ye)),t.routes=this.routes,t},ye=new WeakMap,Pe=function(t,s,n){t=t.toUpperCase(),s=Ke(this._basePath,s);const a={basePath:this._basePath,path:s,method:t,handler:n};this.router.add(t,s,[n,a]),this.routes.push(a)},bt=function(t,s){if(t instanceof Error)return this.errorHandler(t,s);throw t},vt=function(t,s,n,a){if(a==="HEAD")return(async()=>new Response(null,await P(this,X,vt).call(this,t,s,n,"GET")))();const r=this.getPath(t,{env:n}),i=this.router.match(a,r),c=new zn(t,{path:r,matchResult:i,env:n,executionCtx:s,notFoundHandler:p(this,ye)});if(i[0].length===1){let o;try{o=i[0][0][0][0](c,async()=>{c.res=await p(this,ye).call(this,c)})}catch(h){return P(this,X,bt).call(this,h,c)}return o instanceof Promise?o.then(h=>h||(c.finalized?c.res:p(this,ye).call(this,c))).catch(h=>P(this,X,bt).call(this,h,c)):o??p(this,ye).call(this,c)}const l=qt(i[0],this.errorHandler,p(this,ye));return(async()=>{try{const o=await l(c);if(!o.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return o.res}catch(o){return P(this,X,bt).call(this,o,c)}})()},Vt),fn=[];function Vn(e,t){const s=this.buildAllMatchers(),n=(a,r)=>{const i=s[a]||s[Q],c=i[2][r];if(c)return c;const l=r.match(i[0]);if(!l)return[[],fn];const o=l.indexOf("",1);return[i[1][o],l]};return this.match=n,n(e,t)}var wt="[^/]+",lt=".*",ct="(?:|/.*)",Ye=Symbol(),Kn=new Set(".\\+*[^]$()");function Gn(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===lt||e===ct?1:t===lt||t===ct?-1:e===wt?1:t===wt?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var He,ze,be,Kt,Nt=(Kt=class{constructor(){A(this,He);A(this,ze);A(this,be,Object.create(null))}insert(t,s,n,a,r){if(t.length===0){if(p(this,He)!==void 0)throw Ye;if(r)return;E(this,He,s);return}const[i,...c]=t,l=i==="*"?c.length===0?["","",lt]:["","",wt]:i==="/*"?["","",ct]:i.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let o;if(l){const h=l[1];let f=l[2]||wt;if(h&&l[2]&&(f===".*"||(f=f.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(f))))throw Ye;if(o=p(this,be)[f],!o){if(Object.keys(p(this,be)).some(g=>g!==lt&&g!==ct))throw Ye;if(r)return;o=p(this,be)[f]=new Nt,h!==""&&E(o,ze,a.varIndex++)}!r&&h!==""&&n.push([h,p(o,ze)])}else if(o=p(this,be)[i],!o){if(Object.keys(p(this,be)).some(h=>h.length>1&&h!==lt&&h!==ct))throw Ye;if(r)return;o=p(this,be)[i]=new Nt}o.insert(c,s,n,a,r)}buildRegExpStr(){const s=Object.keys(p(this,be)).sort(Gn).map(n=>{const a=p(this,be)[n];return(typeof p(a,ze)=="number"?`(${n})@${p(a,ze)}`:Kn.has(n)?`\\${n}`:n)+a.buildRegExpStr()});return typeof p(this,He)=="number"&&s.unshift(`#${p(this,He)}`),s.length===0?"":s.length===1?s[0]:"(?:"+s.join("|")+")"}},He=new WeakMap,ze=new WeakMap,be=new WeakMap,Kt),Et,gt,Gt,Yn=(Gt=class{constructor(){A(this,Et,{varIndex:0});A(this,gt,new Nt)}insert(e,t,s){const n=[],a=[];for(let i=0;;){let c=!1;if(e=e.replace(/\{[^}]+\}/g,l=>{const o=`@\\${i}`;return a[i]=[o,l],i++,c=!0,o}),!c)break}const r=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let i=a.length-1;i>=0;i--){const[c]=a[i];for(let l=r.length-1;l>=0;l--)if(r[l].indexOf(c)!==-1){r[l]=r[l].replace(c,a[i][1]);break}}return p(this,gt).insert(r,t,n,p(this,Et),s),n}buildRegExp(){let e=p(this,gt).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const s=[],n=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(a,r,i)=>r!==void 0?(s[++t]=Number(r),"$()"):(i!==void 0&&(n[Number(i)]=++t),"")),[new RegExp(`^${e}`),s,n]}},Et=new WeakMap,gt=new WeakMap,Gt),Qn=[/^$/,[],Object.create(null)],_t=Object.create(null);function mn(e){return _t[e]??(_t[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,s)=>s?`\\${s}`:"(?:|/.*)")}$`))}function Xn(){_t=Object.create(null)}function Zn(e){var o;const t=new Yn,s=[];if(e.length===0)return Qn;const n=e.map(h=>[!/\*|\/:/.test(h[0]),...h]).sort(([h,f],[g,y])=>h?1:g?-1:f.length-y.length),a=Object.create(null);for(let h=0,f=-1,g=n.length;h<g;h++){const[y,_,x]=n[h];y?a[_]=[x.map(([L])=>[L,Object.create(null)]),fn]:f++;let j;try{j=t.insert(_,f,y)}catch(L){throw L===Ye?new dn(_):L}y||(s[f]=x.map(([L,se])=>{const pe=Object.create(null);for(se-=1;se>=0;se--){const[J,fe]=j[se];pe[J]=fe}return[L,pe]}))}const[r,i,c]=t.buildRegExp();for(let h=0,f=s.length;h<f;h++)for(let g=0,y=s[h].length;g<y;g++){const _=(o=s[h][g])==null?void 0:o[1];if(!_)continue;const x=Object.keys(_);for(let j=0,L=x.length;j<L;j++)_[x[j]]=c[_[x[j]]]}const l=[];for(const h in i)l[h]=s[i[h]];return[r,l,a]}function Ve(e,t){if(e){for(const s of Object.keys(e).sort((n,a)=>a.length-n.length))if(mn(s).test(t))return[...e[s]]}}var De,je,Rt,gn,Yt,es=(Yt=class{constructor(){A(this,Rt);R(this,"name","RegExpRouter");A(this,De);A(this,je);R(this,"match",Vn);E(this,De,{[Q]:Object.create(null)}),E(this,je,{[Q]:Object.create(null)})}add(e,t,s){var c;const n=p(this,De),a=p(this,je);if(!n||!a)throw new Error(un);n[e]||[n,a].forEach(l=>{l[e]=Object.create(null),Object.keys(l[Q]).forEach(o=>{l[e][o]=[...l[Q][o]]})}),t==="/*"&&(t="*");const r=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const l=mn(t);e===Q?Object.keys(n).forEach(o=>{var h;(h=n[o])[t]||(h[t]=Ve(n[o],t)||Ve(n[Q],t)||[])}):(c=n[e])[t]||(c[t]=Ve(n[e],t)||Ve(n[Q],t)||[]),Object.keys(n).forEach(o=>{(e===Q||e===o)&&Object.keys(n[o]).forEach(h=>{l.test(h)&&n[o][h].push([s,r])})}),Object.keys(a).forEach(o=>{(e===Q||e===o)&&Object.keys(a[o]).forEach(h=>l.test(h)&&a[o][h].push([s,r]))});return}const i=nn(t)||[t];for(let l=0,o=i.length;l<o;l++){const h=i[l];Object.keys(a).forEach(f=>{var g;(e===Q||e===f)&&((g=a[f])[h]||(g[h]=[...Ve(n[f],h)||Ve(n[Q],h)||[]]),a[f][h].push([s,r-o+l+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(p(this,je)).concat(Object.keys(p(this,De))).forEach(t=>{e[t]||(e[t]=P(this,Rt,gn).call(this,t))}),E(this,De,E(this,je,void 0)),Xn(),e}},De=new WeakMap,je=new WeakMap,Rt=new WeakSet,gn=function(e){const t=[];let s=e===Q;return[p(this,De),p(this,je)].forEach(n=>{const a=n[e]?Object.keys(n[e]).map(r=>[r,n[e][r]]):[];a.length!==0?(s||(s=!0),t.push(...a)):e!==Q&&t.push(...Object.keys(n[Q]).map(r=>[r,n[Q][r]]))}),s?Zn(t):null},Yt),$e,Ce,Qt,ts=(Qt=class{constructor(e){R(this,"name","SmartRouter");A(this,$e,[]);A(this,Ce,[]);E(this,$e,e.routers)}add(e,t,s){if(!p(this,Ce))throw new Error(un);p(this,Ce).push([e,t,s])}match(e,t){if(!p(this,Ce))throw new Error("Fatal error");const s=p(this,$e),n=p(this,Ce),a=s.length;let r=0,i;for(;r<a;r++){const c=s[r];try{for(let l=0,o=n.length;l<o;l++)c.add(...n[l]);i=c.match(e,t)}catch(l){if(l instanceof dn)continue;throw l}this.match=c.match.bind(c),E(this,$e,[c]),E(this,Ce,void 0);break}if(r===a)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,i}get activeRouter(){if(p(this,Ce)||p(this,$e).length!==1)throw new Error("No active router has been determined yet.");return p(this,$e)[0]}},$e=new WeakMap,Ce=new WeakMap,Qt),at=Object.create(null),Ie,ie,Be,tt,ne,Oe,Le,Xt,yn=(Xt=class{constructor(e,t,s){A(this,Oe);A(this,Ie);A(this,ie);A(this,Be);A(this,tt,0);A(this,ne,at);if(E(this,ie,s||Object.create(null)),E(this,Ie,[]),e&&t){const n=Object.create(null);n[e]={handler:t,possibleKeys:[],score:0},E(this,Ie,[n])}E(this,Be,[])}insert(e,t,s){E(this,tt,++Mt(this,tt)._);let n=this;const a=Dn(t),r=[];for(let i=0,c=a.length;i<c;i++){const l=a[i],o=a[i+1],h=In(l,o),f=Array.isArray(h)?h[0]:l;if(f in p(n,ie)){n=p(n,ie)[f],h&&r.push(h[1]);continue}p(n,ie)[f]=new yn,h&&(p(n,Be).push(h),r.push(h[1])),n=p(n,ie)[f]}return p(n,Ie).push({[e]:{handler:s,possibleKeys:r.filter((i,c,l)=>l.indexOf(i)===c),score:p(this,tt)}}),n}search(e,t){var c;const s=[];E(this,ne,at);let a=[this];const r=en(t),i=[];for(let l=0,o=r.length;l<o;l++){const h=r[l],f=l===o-1,g=[];for(let y=0,_=a.length;y<_;y++){const x=a[y],j=p(x,ie)[h];j&&(E(j,ne,p(x,ne)),f?(p(j,ie)["*"]&&s.push(...P(this,Oe,Le).call(this,p(j,ie)["*"],e,p(x,ne))),s.push(...P(this,Oe,Le).call(this,j,e,p(x,ne)))):g.push(j));for(let L=0,se=p(x,Be).length;L<se;L++){const pe=p(x,Be)[L],J=p(x,ne)===at?{}:{...p(x,ne)};if(pe==="*"){const m=p(x,ie)["*"];m&&(s.push(...P(this,Oe,Le).call(this,m,e,p(x,ne))),E(m,ne,J),g.push(m));continue}const[fe,Z,O]=pe;if(!h&&!(O instanceof RegExp))continue;const u=p(x,ie)[fe],d=r.slice(l).join("/");if(O instanceof RegExp){const m=O.exec(d);if(m){if(J[Z]=m[0],s.push(...P(this,Oe,Le).call(this,u,e,p(x,ne),J)),Object.keys(p(u,ie)).length){E(u,ne,J);const b=((c=m[0].match(/\//))==null?void 0:c.length)??0;(i[b]||(i[b]=[])).push(u)}continue}}(O===!0||O.test(h))&&(J[Z]=h,f?(s.push(...P(this,Oe,Le).call(this,u,e,J,p(x,ne))),p(u,ie)["*"]&&s.push(...P(this,Oe,Le).call(this,p(u,ie)["*"],e,J,p(x,ne)))):(E(u,ne,J),g.push(u)))}}a=g.concat(i.shift()??[])}return s.length>1&&s.sort((l,o)=>l.score-o.score),[s.map(({handler:l,params:o})=>[l,o])]}},Ie=new WeakMap,ie=new WeakMap,Be=new WeakMap,tt=new WeakMap,ne=new WeakMap,Oe=new WeakSet,Le=function(e,t,s,n){const a=[];for(let r=0,i=p(e,Ie).length;r<i;r++){const c=p(e,Ie)[r],l=c[t]||c[Q],o={};if(l!==void 0&&(l.params=Object.create(null),a.push(l),s!==at||n&&n!==at))for(let h=0,f=l.possibleKeys.length;h<f;h++){const g=l.possibleKeys[h],y=o[l.score];l.params[g]=n!=null&&n[g]&&!y?n[g]:s[g]??(n==null?void 0:n[g]),o[l.score]=!0}}return a},Xt),Ue,Zt,ns=(Zt=class{constructor(){R(this,"name","TrieRouter");A(this,Ue);E(this,Ue,new yn)}add(e,t,s){const n=nn(t);if(n){for(let a=0,r=n.length;a<r;a++)p(this,Ue).insert(e,n[a],s);return}p(this,Ue).insert(e,t,s)}match(e,t){return p(this,Ue).search(e,t)}},Ue=new WeakMap,Zt),qe=class extends hn{constructor(e={}){super(e),this.router=e.router??new ts({routers:[new es,new ns]})}},ss=e=>{const s={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},n=(r=>typeof r=="string"?r==="*"?()=>r:i=>r===i?i:null:typeof r=="function"?r:i=>r.includes(i)?i:null)(s.origin),a=(r=>typeof r=="function"?r:Array.isArray(r)?()=>r:()=>[])(s.allowMethods);return async function(i,c){var h;function l(f,g){i.res.headers.set(f,g)}const o=await n(i.req.header("origin")||"",i);if(o&&l("Access-Control-Allow-Origin",o),s.origin!=="*"){const f=i.req.header("Vary");f?l("Vary",f):l("Vary","Origin")}if(s.credentials&&l("Access-Control-Allow-Credentials","true"),(h=s.exposeHeaders)!=null&&h.length&&l("Access-Control-Expose-Headers",s.exposeHeaders.join(",")),i.req.method==="OPTIONS"){s.maxAge!=null&&l("Access-Control-Max-Age",s.maxAge.toString());const f=await a(i.req.header("origin")||"",i);f.length&&l("Access-Control-Allow-Methods",f.join(","));let g=s.allowHeaders;if(!(g!=null&&g.length)){const y=i.req.header("Access-Control-Request-Headers");y&&(g=y.split(/\s*,\s*/))}return g!=null&&g.length&&(l("Access-Control-Allow-Headers",g.join(",")),i.res.headers.append("Vary","Access-Control-Request-Headers")),i.res.headers.delete("Content-Length"),i.res.headers.delete("Content-Type"),new Response(null,{headers:i.res.headers,status:204,statusText:"No Content"})}await c()}},rs=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,Ft=(e,t=is)=>{const s=/\.([a-zA-Z0-9]+?)$/,n=e.match(s);if(!n)return;let a=t[n[1]];return a&&a.startsWith("text")&&(a+="; charset=utf-8"),a},as={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},is=as,os=(...e)=>{let t=e.filter(a=>a!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const s=t.split("/"),n=[];for(const a of s)a===".."&&n.length>0&&n.at(-1)!==".."?n.pop():a!=="."&&n.push(a);return n.join("/")||"."},bn={br:".br",zstd:".zst",gzip:".gz"},ls=Object.keys(bn),cs="index.html",us=e=>{const t=e.root??"./",s=e.path,n=e.join??os;return async(a,r)=>{var h,f,g,y;if(a.finalized)return r();let i;if(e.path)i=e.path;else try{if(i=decodeURIComponent(a.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(i))throw new Error}catch{return await((h=e.onNotFound)==null?void 0:h.call(e,a.req.path,a)),r()}let c=n(t,!s&&e.rewriteRequestPath?e.rewriteRequestPath(i):i);e.isDir&&await e.isDir(c)&&(c=n(c,cs));const l=e.getContent;let o=await l(c,a);if(o instanceof Response)return a.newResponse(o.body,o);if(o){const _=e.mimes&&Ft(c,e.mimes)||Ft(c);if(a.header("Content-Type",_||"application/octet-stream"),e.precompressed&&(!_||rs.test(_))){const x=new Set((f=a.req.header("Accept-Encoding"))==null?void 0:f.split(",").map(j=>j.trim()));for(const j of ls){if(!x.has(j))continue;const L=await l(c+bn[j],a);if(L){o=L,a.header("Content-Encoding",j),a.header("Vary","Accept-Encoding",{append:!0});break}}}return await((g=e.onFound)==null?void 0:g.call(e,c,a)),a.body(o)}await((y=e.onNotFound)==null?void 0:y.call(e,c,a)),await r()}},ds=async(e,t)=>{let s;t&&t.manifest?typeof t.manifest=="string"?s=JSON.parse(t.manifest):s=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?s=JSON.parse(__STATIC_CONTENT_MANIFEST):s=__STATIC_CONTENT_MANIFEST;let n;t&&t.namespace?n=t.namespace:n=__STATIC_CONTENT;const a=s[e]||e;if(!a)return null;const r=await n.get(a,{type:"stream"});return r||null},hs=e=>async function(s,n){return us({...e,getContent:async r=>ds(r,{manifest:e.manifest,namespace:e.namespace?e.namespace:s.env?s.env.__STATIC_CONTENT:void 0})})(s,n)},ps=e=>hs(e);function fs(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var xt={exports:{}};/* @license
Papa Parse
v5.5.3
https://github.com/mholt/PapaParse
License: MIT
*/var ms=xt.exports,Ht;function gs(){return Ht||(Ht=1,(function(e,t){((s,n)=>{e.exports=n()})(ms,function s(){var n=typeof self<"u"?self:typeof window<"u"?window:n!==void 0?n:{},a,r=!n.document&&!!n.postMessage,i=n.IS_PAPA_WORKER||!1,c={},l=0,o={};function h(u){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},(function(d){var m=fe(d);m.chunkSize=parseInt(m.chunkSize),d.step||d.chunk||(m.chunkSize=null),this._handle=new x(m),(this._handle.streamer=this)._config=m}).call(this,u),this.parseChunk=function(d,m){var b=parseInt(this._config.skipFirstNLines)||0;if(this.isFirstChunk&&0<b){let N=this._config.newline;N||(v=this._config.quoteChar||'"',N=this._handle.guessLineEndings(d,v)),d=[...d.split(N).slice(b)].join(N)}this.isFirstChunk&&O(this._config.beforeFirstChunk)&&(v=this._config.beforeFirstChunk(d))!==void 0&&(d=v),this.isFirstChunk=!1,this._halted=!1;var b=this._partialLine+d,v=(this._partialLine="",this._handle.parse(b,this._baseIndex,!this._finished));if(!this._handle.paused()&&!this._handle.aborted()){if(d=v.meta.cursor,b=(this._finished||(this._partialLine=b.substring(d-this._baseIndex),this._baseIndex=d),v&&v.data&&(this._rowCount+=v.data.length),this._finished||this._config.preview&&this._rowCount>=this._config.preview),i)n.postMessage({results:v,workerId:o.WORKER_ID,finished:b});else if(O(this._config.chunk)&&!m){if(this._config.chunk(v,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);this._completeResults=v=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(v.data),this._completeResults.errors=this._completeResults.errors.concat(v.errors),this._completeResults.meta=v.meta),this._completed||!b||!O(this._config.complete)||v&&v.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),b||v&&v.meta.paused||this._nextChunk(),v}this._halted=!0},this._sendError=function(d){O(this._config.error)?this._config.error(d):i&&this._config.error&&n.postMessage({workerId:o.WORKER_ID,error:d,finished:!1})}}function f(u){var d;(u=u||{}).chunkSize||(u.chunkSize=o.RemoteChunkSize),h.call(this,u),this._nextChunk=r?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(m){this._input=m,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(d=new XMLHttpRequest,this._config.withCredentials&&(d.withCredentials=this._config.withCredentials),r||(d.onload=Z(this._chunkLoaded,this),d.onerror=Z(this._chunkError,this)),d.open(this._config.downloadRequestBody?"POST":"GET",this._input,!r),this._config.downloadRequestHeaders){var m,b=this._config.downloadRequestHeaders;for(m in b)d.setRequestHeader(m,b[m])}var v;this._config.chunkSize&&(v=this._start+this._config.chunkSize-1,d.setRequestHeader("Range","bytes="+this._start+"-"+v));try{d.send(this._config.downloadRequestBody)}catch(N){this._chunkError(N.message)}r&&d.status===0&&this._chunkError()}},this._chunkLoaded=function(){d.readyState===4&&(d.status<200||400<=d.status?this._chunkError():(this._start+=this._config.chunkSize||d.responseText.length,this._finished=!this._config.chunkSize||this._start>=(m=>(m=m.getResponseHeader("Content-Range"))!==null?parseInt(m.substring(m.lastIndexOf("/")+1)):-1)(d),this.parseChunk(d.responseText)))},this._chunkError=function(m){m=d.statusText||m,this._sendError(new Error(m))}}function g(u){(u=u||{}).chunkSize||(u.chunkSize=o.LocalChunkSize),h.call(this,u);var d,m,b=typeof FileReader<"u";this.stream=function(v){this._input=v,m=v.slice||v.webkitSlice||v.mozSlice,b?((d=new FileReader).onload=Z(this._chunkLoaded,this),d.onerror=Z(this._chunkError,this)):d=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var v=this._input,N=(this._config.chunkSize&&(N=Math.min(this._start+this._config.chunkSize,this._input.size),v=m.call(v,this._start,N)),d.readAsText(v,this._config.encoding));b||this._chunkLoaded({target:{result:N}})},this._chunkLoaded=function(v){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(v.target.result)},this._chunkError=function(){this._sendError(d.error)}}function y(u){var d;h.call(this,u=u||{}),this.stream=function(m){return d=m,this._nextChunk()},this._nextChunk=function(){var m,b;if(!this._finished)return m=this._config.chunkSize,d=m?(b=d.substring(0,m),d.substring(m)):(b=d,""),this._finished=!d,this.parseChunk(b)}}function _(u){h.call(this,u=u||{});var d=[],m=!0,b=!1;this.pause=function(){h.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){h.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(v){this._input=v,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){b&&d.length===1&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),d.length?this.parseChunk(d.shift()):m=!0},this._streamData=Z(function(v){try{d.push(typeof v=="string"?v:v.toString(this._config.encoding)),m&&(m=!1,this._checkIsFinished(),this.parseChunk(d.shift()))}catch(N){this._streamError(N)}},this),this._streamError=Z(function(v){this._streamCleanUp(),this._sendError(v)},this),this._streamEnd=Z(function(){this._streamCleanUp(),b=!0,this._streamData("")},this),this._streamCleanUp=Z(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function x(u){var d,m,b,v,N=Math.pow(2,53),K=-N,ce=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,ue=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,D=this,B=0,S=0,re=!1,k=!1,$=[],w={data:[],errors:[],meta:{}};function G(I){return u.skipEmptyLines==="greedy"?I.join("").trim()==="":I.length===1&&I[0].length===0}function V(){if(w&&b&&(de("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+o.DefaultDelimiter+"'"),b=!1),u.skipEmptyLines&&(w.data=w.data.filter(function(C){return!G(C)})),te()){let C=function(W,Y){O(u.transformHeader)&&(W=u.transformHeader(W,Y)),$.push(W)};if(w)if(Array.isArray(w.data[0])){for(var I=0;te()&&I<w.data.length;I++)w.data[I].forEach(C);w.data.splice(0,1)}else w.data.forEach(C)}function q(C,W){for(var Y=u.header?{}:[],F=0;F<C.length;F++){var H=F,M=C[F],M=((me,T)=>(z=>(u.dynamicTypingFunction&&u.dynamicTyping[z]===void 0&&(u.dynamicTyping[z]=u.dynamicTypingFunction(z)),(u.dynamicTyping[z]||u.dynamicTyping)===!0))(me)?T==="true"||T==="TRUE"||T!=="false"&&T!=="FALSE"&&((z=>{if(ce.test(z)&&(z=parseFloat(z),K<z&&z<N))return 1})(T)?parseFloat(T):ue.test(T)?new Date(T):T===""?null:T):T)(H=u.header?F>=$.length?"__parsed_extra":$[F]:H,M=u.transform?u.transform(M,H):M);H==="__parsed_extra"?(Y[H]=Y[H]||[],Y[H].push(M)):Y[H]=M}return u.header&&(F>$.length?de("FieldMismatch","TooManyFields","Too many fields: expected "+$.length+" fields but parsed "+F,S+W):F<$.length&&de("FieldMismatch","TooFewFields","Too few fields: expected "+$.length+" fields but parsed "+F,S+W)),Y}var U;w&&(u.header||u.dynamicTyping||u.transform)&&(U=1,!w.data.length||Array.isArray(w.data[0])?(w.data=w.data.map(q),U=w.data.length):w.data=q(w.data,0),u.header&&w.meta&&(w.meta.fields=$),S+=U)}function te(){return u.header&&$.length===0}function de(I,q,U,C){I={type:I,code:q,message:U},C!==void 0&&(I.row=C),w.errors.push(I)}O(u.step)&&(v=u.step,u.step=function(I){w=I,te()?V():(V(),w.data.length!==0&&(B+=I.data.length,u.preview&&B>u.preview?m.abort():(w.data=w.data[0],v(w,D))))}),this.parse=function(I,q,U){var C=u.quoteChar||'"',C=(u.newline||(u.newline=this.guessLineEndings(I,C)),b=!1,u.delimiter?O(u.delimiter)&&(u.delimiter=u.delimiter(I),w.meta.delimiter=u.delimiter):((C=((W,Y,F,H,M)=>{var me,T,z,Te;M=M||[",","	","|",";",o.RECORD_SEP,o.UNIT_SEP];for(var We=0;We<M.length;We++){for(var _e,st=M[We],ae=0,xe=0,ee=0,le=(z=void 0,new L({comments:H,delimiter:st,newline:Y,preview:10}).parse(W)),Ee=0;Ee<le.data.length;Ee++)F&&G(le.data[Ee])?ee++:(_e=le.data[Ee].length,xe+=_e,z===void 0?z=_e:0<_e&&(ae+=Math.abs(_e-z),z=_e));0<le.data.length&&(xe/=le.data.length-ee),(T===void 0||ae<=T)&&(Te===void 0||Te<xe)&&1.99<xe&&(T=ae,me=st,Te=xe)}return{successful:!!(u.delimiter=me),bestDelimiter:me}})(I,u.newline,u.skipEmptyLines,u.comments,u.delimitersToGuess)).successful?u.delimiter=C.bestDelimiter:(b=!0,u.delimiter=o.DefaultDelimiter),w.meta.delimiter=u.delimiter),fe(u));return u.preview&&u.header&&C.preview++,d=I,m=new L(C),w=m.parse(d,q,U),V(),re?{meta:{paused:!0}}:w||{meta:{paused:!1}}},this.paused=function(){return re},this.pause=function(){re=!0,m.abort(),d=O(u.chunk)?"":d.substring(m.getCharIndex())},this.resume=function(){D.streamer._halted?(re=!1,D.streamer.parseChunk(d,!0)):setTimeout(D.resume,3)},this.aborted=function(){return k},this.abort=function(){k=!0,m.abort(),w.meta.aborted=!0,O(u.complete)&&u.complete(w),d=""},this.guessLineEndings=function(W,C){W=W.substring(0,1048576);var C=new RegExp(j(C)+"([^]*?)"+j(C),"gm"),U=(W=W.replace(C,"")).split("\r"),C=W.split(`
`),W=1<C.length&&C[0].length<U[0].length;if(U.length===1||W)return`
`;for(var Y=0,F=0;F<U.length;F++)U[F][0]===`
`&&Y++;return Y>=U.length/2?`\r
`:"\r"}}function j(u){return u.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function L(u){var d=(u=u||{}).delimiter,m=u.newline,b=u.comments,v=u.step,N=u.preview,K=u.fastMode,ce=null,ue=!1,D=u.quoteChar==null?'"':u.quoteChar,B=D;if(u.escapeChar!==void 0&&(B=u.escapeChar),(typeof d!="string"||-1<o.BAD_DELIMITERS.indexOf(d))&&(d=","),b===d)throw new Error("Comment character same as delimiter");b===!0?b="#":(typeof b!="string"||-1<o.BAD_DELIMITERS.indexOf(b))&&(b=!1),m!==`
`&&m!=="\r"&&m!==`\r
`&&(m=`
`);var S=0,re=!1;this.parse=function(k,$,w){if(typeof k!="string")throw new Error("Input must be a string");var G=k.length,V=d.length,te=m.length,de=b.length,I=O(v),q=[],U=[],C=[],W=S=0;if(!k)return ae();if(K||K!==!1&&k.indexOf(D)===-1){for(var Y=k.split(m),F=0;F<Y.length;F++){if(C=Y[F],S+=C.length,F!==Y.length-1)S+=m.length;else if(w)return ae();if(!b||C.substring(0,de)!==b){if(I){if(q=[],Te(C.split(d)),xe(),re)return ae()}else Te(C.split(d));if(N&&N<=F)return q=q.slice(0,N),ae(!0)}}return ae()}for(var H=k.indexOf(d,S),M=k.indexOf(m,S),me=new RegExp(j(B)+j(D),"g"),T=k.indexOf(D,S);;)if(k[S]===D)for(T=S,S++;;){if((T=k.indexOf(D,T+1))===-1)return w||U.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:q.length,index:S}),_e();if(T===G-1)return _e(k.substring(S,T).replace(me,D));if(D===B&&k[T+1]===B)T++;else if(D===B||T===0||k[T-1]!==B){H!==-1&&H<T+1&&(H=k.indexOf(d,T+1));var z=We((M=M!==-1&&M<T+1?k.indexOf(m,T+1):M)===-1?H:Math.min(H,M));if(k.substr(T+1+z,V)===d){C.push(k.substring(S,T).replace(me,D)),k[S=T+1+z+V]!==D&&(T=k.indexOf(D,S)),H=k.indexOf(d,S),M=k.indexOf(m,S);break}if(z=We(M),k.substring(T+1+z,T+1+z+te)===m){if(C.push(k.substring(S,T).replace(me,D)),st(T+1+z+te),H=k.indexOf(d,S),T=k.indexOf(D,S),I&&(xe(),re))return ae();if(N&&q.length>=N)return ae(!0);break}U.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:q.length,index:S}),T++}}else if(b&&C.length===0&&k.substring(S,S+de)===b){if(M===-1)return ae();S=M+te,M=k.indexOf(m,S),H=k.indexOf(d,S)}else if(H!==-1&&(H<M||M===-1))C.push(k.substring(S,H)),S=H+V,H=k.indexOf(d,S);else{if(M===-1)break;if(C.push(k.substring(S,M)),st(M+te),I&&(xe(),re))return ae();if(N&&q.length>=N)return ae(!0)}return _e();function Te(ee){q.push(ee),W=S}function We(ee){var le=0;return le=ee!==-1&&(ee=k.substring(T+1,ee))&&ee.trim()===""?ee.length:le}function _e(ee){return w||(ee===void 0&&(ee=k.substring(S)),C.push(ee),S=G,Te(C),I&&xe()),ae()}function st(ee){S=ee,Te(C),C=[],M=k.indexOf(m,S)}function ae(ee){if(u.header&&!$&&q.length&&!ue){var le=q[0],Ee=Object.create(null),Ct=new Set(le);let jt=!1;for(let Je=0;Je<le.length;Je++){let we=le[Je];if(Ee[we=O(u.transformHeader)?u.transformHeader(we,Je):we]){let rt,$t=Ee[we];for(;rt=we+"_"+$t,$t++,Ct.has(rt););Ct.add(rt),le[Je]=rt,Ee[we]++,jt=!0,(ce=ce===null?{}:ce)[rt]=we}else Ee[we]=1,le[Je]=we;Ct.add(we)}jt&&console.warn("Duplicate headers found and renamed."),ue=!0}return{data:q,errors:U,meta:{delimiter:d,linebreak:m,aborted:re,truncated:!!ee,cursor:W+($||0),renamedHeaders:ce}}}function xe(){v(ae()),q=[],U=[]}},this.abort=function(){re=!0},this.getCharIndex=function(){return S}}function se(u){var d=u.data,m=c[d.workerId],b=!1;if(d.error)m.userError(d.error,d.file);else if(d.results&&d.results.data){var v={abort:function(){b=!0,pe(d.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:J,resume:J};if(O(m.userStep)){for(var N=0;N<d.results.data.length&&(m.userStep({data:d.results.data[N],errors:d.results.errors,meta:d.results.meta},v),!b);N++);delete d.results}else O(m.userChunk)&&(m.userChunk(d.results,v,d.file),delete d.results)}d.finished&&!b&&pe(d.workerId,d.results)}function pe(u,d){var m=c[u];O(m.userComplete)&&m.userComplete(d),m.terminate(),delete c[u]}function J(){throw new Error("Not implemented.")}function fe(u){if(typeof u!="object"||u===null)return u;var d,m=Array.isArray(u)?[]:{};for(d in u)m[d]=fe(u[d]);return m}function Z(u,d){return function(){u.apply(d,arguments)}}function O(u){return typeof u=="function"}return o.parse=function(u,d){var m=(d=d||{}).dynamicTyping||!1;if(O(m)&&(d.dynamicTypingFunction=m,m={}),d.dynamicTyping=m,d.transform=!!O(d.transform)&&d.transform,!d.worker||!o.WORKERS_SUPPORTED)return m=null,o.NODE_STREAM_INPUT,typeof u=="string"?(u=(b=>b.charCodeAt(0)!==65279?b:b.slice(1))(u),m=new(d.download?f:y)(d)):u.readable===!0&&O(u.read)&&O(u.on)?m=new _(d):(n.File&&u instanceof File||u instanceof Object)&&(m=new g(d)),m.stream(u);(m=(()=>{var b;return!!o.WORKERS_SUPPORTED&&(b=(()=>{var v=n.URL||n.webkitURL||null,N=s.toString();return o.BLOB_URL||(o.BLOB_URL=v.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",N,")();"],{type:"text/javascript"})))})(),(b=new n.Worker(b)).onmessage=se,b.id=l++,c[b.id]=b)})()).userStep=d.step,m.userChunk=d.chunk,m.userComplete=d.complete,m.userError=d.error,d.step=O(d.step),d.chunk=O(d.chunk),d.complete=O(d.complete),d.error=O(d.error),delete d.worker,m.postMessage({input:u,config:d,workerId:m.id})},o.unparse=function(u,d){var m=!1,b=!0,v=",",N=`\r
`,K='"',ce=K+K,ue=!1,D=null,B=!1,S=((()=>{if(typeof d=="object"){if(typeof d.delimiter!="string"||o.BAD_DELIMITERS.filter(function($){return d.delimiter.indexOf($)!==-1}).length||(v=d.delimiter),typeof d.quotes!="boolean"&&typeof d.quotes!="function"&&!Array.isArray(d.quotes)||(m=d.quotes),typeof d.skipEmptyLines!="boolean"&&typeof d.skipEmptyLines!="string"||(ue=d.skipEmptyLines),typeof d.newline=="string"&&(N=d.newline),typeof d.quoteChar=="string"&&(K=d.quoteChar),typeof d.header=="boolean"&&(b=d.header),Array.isArray(d.columns)){if(d.columns.length===0)throw new Error("Option columns is empty");D=d.columns}d.escapeChar!==void 0&&(ce=d.escapeChar+K),d.escapeFormulae instanceof RegExp?B=d.escapeFormulae:typeof d.escapeFormulae=="boolean"&&d.escapeFormulae&&(B=/^[=+\-@\t\r].*$/)}})(),new RegExp(j(K),"g"));if(typeof u=="string"&&(u=JSON.parse(u)),Array.isArray(u)){if(!u.length||Array.isArray(u[0]))return re(null,u,ue);if(typeof u[0]=="object")return re(D||Object.keys(u[0]),u,ue)}else if(typeof u=="object")return typeof u.data=="string"&&(u.data=JSON.parse(u.data)),Array.isArray(u.data)&&(u.fields||(u.fields=u.meta&&u.meta.fields||D),u.fields||(u.fields=Array.isArray(u.data[0])?u.fields:typeof u.data[0]=="object"?Object.keys(u.data[0]):[]),Array.isArray(u.data[0])||typeof u.data[0]=="object"||(u.data=[u.data])),re(u.fields||[],u.data||[],ue);throw new Error("Unable to serialize unrecognized input");function re($,w,G){var V="",te=(typeof $=="string"&&($=JSON.parse($)),typeof w=="string"&&(w=JSON.parse(w)),Array.isArray($)&&0<$.length),de=!Array.isArray(w[0]);if(te&&b){for(var I=0;I<$.length;I++)0<I&&(V+=v),V+=k($[I],I);0<w.length&&(V+=N)}for(var q=0;q<w.length;q++){var U=(te?$:w[q]).length,C=!1,W=te?Object.keys(w[q]).length===0:w[q].length===0;if(G&&!te&&(C=G==="greedy"?w[q].join("").trim()==="":w[q].length===1&&w[q][0].length===0),G==="greedy"&&te){for(var Y=[],F=0;F<U;F++){var H=de?$[F]:F;Y.push(w[q][H])}C=Y.join("").trim()===""}if(!C){for(var M=0;M<U;M++){0<M&&!W&&(V+=v);var me=te&&de?$[M]:M;V+=k(w[q][me],M)}q<w.length-1&&(!G||0<U&&!W)&&(V+=N)}}return V}function k($,w){var G,V;return $==null?"":$.constructor===Date?JSON.stringify($).slice(1,25):(V=!1,B&&typeof $=="string"&&B.test($)&&($="'"+$,V=!0),G=$.toString().replace(S,ce),(V=V||m===!0||typeof m=="function"&&m($,w)||Array.isArray(m)&&m[w]||((te,de)=>{for(var I=0;I<de.length;I++)if(-1<te.indexOf(de[I]))return!0;return!1})(G,o.BAD_DELIMITERS)||-1<G.indexOf(v)||G.charAt(0)===" "||G.charAt(G.length-1)===" ")?K+G+K:G)}},o.RECORD_SEP="",o.UNIT_SEP="",o.BYTE_ORDER_MARK="\uFEFF",o.BAD_DELIMITERS=["\r",`
`,'"',o.BYTE_ORDER_MARK],o.WORKERS_SUPPORTED=!r&&!!n.Worker,o.NODE_STREAM_INPUT=1,o.LocalChunkSize=10485760,o.RemoteChunkSize=5242880,o.DefaultDelimiter=",",o.Parser=L,o.ParserHandle=x,o.NetworkStreamer=f,o.FileStreamer=g,o.StringStreamer=y,o.ReadableStreamStreamer=_,n.jQuery&&((a=n.jQuery).fn.parse=function(u){var d=u.config||{},m=[];return this.each(function(N){if(!(a(this).prop("tagName").toUpperCase()==="INPUT"&&a(this).attr("type").toLowerCase()==="file"&&n.FileReader)||!this.files||this.files.length===0)return!0;for(var K=0;K<this.files.length;K++)m.push({file:this.files[K],inputElem:this,instanceConfig:a.extend({},d)})}),b(),this;function b(){if(m.length===0)O(u.complete)&&u.complete();else{var N,K,ce,ue,D=m[0];if(O(u.before)){var B=u.before(D.file,D.inputElem);if(typeof B=="object"){if(B.action==="abort")return N="AbortError",K=D.file,ce=D.inputElem,ue=B.reason,void(O(u.error)&&u.error({name:N},K,ce,ue));if(B.action==="skip")return void v();typeof B.config=="object"&&(D.instanceConfig=a.extend(D.instanceConfig,B.config))}else if(B==="skip")return void v()}var S=D.instanceConfig.complete;D.instanceConfig.complete=function(re){O(S)&&S(re,D.file,D.inputElem),v()},o.parse(D.file,D.instanceConfig)}}function v(){m.splice(0,1),b()}}),i&&(n.onmessage=function(u){u=u.data,o.WORKER_ID===void 0&&u&&(o.WORKER_ID=u.workerId),typeof u.input=="string"?n.postMessage({workerId:o.WORKER_ID,results:o.parse(u.input,u.config),finished:!0}):(n.File&&u.input instanceof File||u.input instanceof Object)&&(u=o.parse(u.input,u.config))&&n.postMessage({workerId:o.WORKER_ID,results:u,finished:!0})}),(f.prototype=Object.create(h.prototype)).constructor=f,(g.prototype=Object.create(h.prototype)).constructor=g,(y.prototype=Object.create(y.prototype)).constructor=y,(_.prototype=Object.create(h.prototype)).constructor=_,o})})(xt)),xt.exports}var ys=gs();const bs=fs(ys);function vs(e,t={}){const{maxRows:s=1e4}=t,n=bs.parse(e,{header:!0,dynamicTyping:!0,skipEmptyLines:!0,transformHeader:a=>a.trim(),preview:s});return n.errors.length>0&&console.warn("CSV parsing warnings:",n.errors.slice(0,5)),n.data}function _s(e){if(e.length===0)return{};const t=Object.keys(e[0]),s={};for(const n of t){const a=e.slice(0,Math.min(100,e.length)).map(r=>r[n]);s[n]=xs(a)}return s}function xs(e){const t=e.filter(r=>r!=null&&r!=="");if(t.length===0)return"string";if(t.filter(r=>typeof r=="number"&&!isNaN(r)).length===t.length)return"number";if(t.filter(r=>typeof r=="boolean").length===t.length)return"boolean";const a=t.filter(r=>{if(typeof r=="string"){const i=Date.parse(r);return!isNaN(i)}return!1}).length;return a===t.length&&a>0?"date":"string"}function ws(e,t){const s=[];for(const n of e){const a=n.name.toLowerCase();if(!((a.endsWith("id")||a.endsWith("_id")||a==="id")&&n.type==="number"))continue;const i=n.name.replace(/[_-]?id$/i,""),c=[`${i}Name`,`${i}_name`,`${i}name`,`${i.toLowerCase()}name`,`${i}`];for(const l of c){const o=e.find(h=>h.name.toLowerCase()===l.toLowerCase()&&h.type==="string");if(o){const h=n.unique_count/t,f=o.unique_count/t;let g=.5;Math.abs(h-f)<.2?g=.9:Math.abs(h-f)<.4&&(g=.7),s.push({id_column:n.name,name_column:o.name,confidence:g});break}}}return s.filter(n=>n.confidence>=.5)}function Es(e,t){if(t.length===0)return e;const s=new Map;for(const n of t){const a=new Map;for(const r of e){const i=r[n.id_column],c=r[n.name_column];i!=null&&c&&a.set(i,c)}s.set(n.id_column,a)}return e.map(n=>{const a={...n};for(const r of t){const i=a[r.id_column],c=s.get(r.id_column);c&&c.has(i)&&(a[`${r.id_column}_original`]=i,a[r.id_column]=c.get(i))}return a})}const vn=new qe;vn.post("/",async e=>{try{const s=(await e.req.formData()).get("file");if(!s)return e.json({error:"No file provided"},400);const n=s.name,a=n.endsWith(".csv")?"csv":n.endsWith(".json")?"json":null;if(!a)return e.json({error:"Unsupported file type. Please upload CSV or JSON."},400);if(s.size>5*1024*1024)return e.json({error:"File too large. Maximum size is 5MB."},400);const r=await s.text();let i;if(a==="csv")i=vs(r);else try{const _=JSON.parse(r);i=Array.isArray(_)?_:[_]}catch{return e.json({error:"Invalid JSON format"},400)}if(i.length===0)return e.json({error:"File contains no data"},400);if(i.length>1e4)return e.json({error:"Dataset too large. Maximum 10,000 rows supported."},400);const c=_s(i),l=Object.keys(i[0]).map(_=>({name:_,type:c[_]||"string",nullable:i.some(x=>x[_]===null||x[_]===void 0||x[_]===""),unique_count:new Set(i.map(x=>x[_])).size,sample_values:i.slice(0,3).map(x=>x[_])})),h=(await e.env.DB.prepare(`
      INSERT INTO datasets (name, original_filename, file_type, row_count, column_count, columns, analysis_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(n.replace(/\.[^.]+$/,""),n,a,i.length,l.length,JSON.stringify(l),"analyzing").run()).meta.last_row_id,f=i.map((_,x)=>e.env.DB.prepare(`
        INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned)
        VALUES (?, ?, ?, ?)
      `).bind(h,x,JSON.stringify(_),0)),g=100;for(let _=0;_<f.length;_+=g){const x=f.slice(_,_+g);await e.env.DB.batch(x)}console.log("Detecting column mappings...");const y=ws(l,i.length);console.log(`Detected ${y.length} column mappings`);for(const _ of y)await e.env.DB.prepare(`
        INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
        VALUES (?, ?, ?, 1)
      `).bind(h,_.id_column,_.name_column).run(),console.log(`  Mapped: ${_.id_column} -> ${_.name_column} (confidence: ${_.confidence})`);return e.json({success:!0,dataset_id:h,message:"Upload successful. Analysis started.",row_count:i.length,column_count:l.length,columns:l})}catch(t){return console.error("Upload error:",t),e.json({error:"Upload failed: "+t.message},500)}});const nt=new qe;nt.get("/",async e=>{try{const s=(await e.env.DB.prepare(`
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
    `).bind(t).run(),e.json({success:!0,message:"Dataset deleted"})}catch{return e.json({error:"Failed to delete dataset"},500)}});function Rs(e,t){const s=e.filter(r=>r!=null&&r!==""),n=e.length-s.length,a=new Set(s).size;if(t==="number"){const r=s.map(i=>Number(i)).filter(i=>!isNaN(i));return{count:e.length,mean:Me(r),median:Ss(r),mode:zt(r),stdDev:Cs(r),min:Math.min(...r),max:Math.max(...r),q1:ut(r,25),q2:ut(r,50),q3:ut(r,75),nullCount:n,uniqueCount:a}}return{count:e.length,mode:zt(s),min:s[0],max:s[s.length-1],nullCount:n,uniqueCount:a}}function Me(e){return e.length===0?0:e.reduce((t,s)=>t+s,0)/e.length}function Ss(e){if(e.length===0)return 0;const t=[...e].sort((n,a)=>n-a),s=Math.floor(t.length/2);return t.length%2===0?(t[s-1]+t[s])/2:t[s]}function zt(e){if(e.length===0)return null;const t={};let s=0,n=null;for(const a of e){const r=String(a);t[r]=(t[r]||0)+1,t[r]>s&&(s=t[r],n=a)}return n}function Cs(e){if(e.length===0)return 0;const t=Me(e),s=e.map(n=>Math.pow(n-t,2));return Math.sqrt(Me(s))}function ut(e,t){if(e.length===0)return 0;const s=[...e].sort((c,l)=>c-l),n=t/100*(s.length-1),a=Math.floor(n),r=Math.ceil(n),i=n%1;return a===r?s[a]:s[a]*(1-i)+s[r]*i}function Os(e){if(e.length<4)return{indices:[],threshold:0};const t=ut(e,25),s=ut(e,75),n=s-t,a=t-1.5*n,r=s+1.5*n,i=[];return e.forEach((c,l)=>{(c<a||c>r)&&i.push(l)}),{indices:i,threshold:n}}function ks(e,t){if(e.length!==t.length||e.length===0)return 0;const s=e.length,n=Me(e),a=Me(t);let r=0,i=0,c=0;for(let l=0;l<s;l++){const o=e[l]-n,h=t[l]-a;r+=o*h,i+=o*o,c+=h*h}return i===0||c===0?0:r/Math.sqrt(i*c)}function Ts(e){if(e.length<2)return{direction:"stable",strength:0};const t=e.length,s=Array.from({length:t},(o,h)=>h),n=Me(s),a=Me(e);let r=0,i=0;for(let o=0;o<t;o++)r+=(s[o]-n)*(e[o]-a),i+=Math.pow(s[o]-n,2);const c=i===0?0:r/i,l=Math.min(Math.abs(c)/(Me(e)||1),1);return Math.abs(c)<.01?{direction:"stable",strength:0}:{direction:c>0?"up":"down",strength:l}}function it(e,t,s,n){var i;let a=50;const r=[];if(t){const c=t.toLowerCase();(c.includes("id")||c==="index")&&(a-=30,r.push("Identifier column (typically unique values)")),c.includes("name")&&n.uniqueCount/n.count>.8&&(a-=25,r.push("High cardinality name column")),(c.includes("email")||c.includes("phone")||c.includes("address"))&&(a-=30,r.push("Personal identifier (typically unique)")),(c.includes("time")||c.includes("date"))&&n.uniqueCount/n.count>.9&&(a-=20,r.push("High precision timestamp"))}switch(e){case"statistics":n.uniqueCount===1?(a-=40,r.push("All values are identical")):n.uniqueCount===n.count?(a-=35,r.push("All values are unique (no patterns)")):n.uniqueCount/n.count>.9?(a-=25,r.push("Very high cardinality (few patterns)")):n.uniqueCount/n.count<.1&&(a+=20,r.push("Low cardinality (clear patterns)")),n.stdDev!==void 0&&n.mean!==void 0&&n.stdDev/Math.abs(n.mean||1)>.5&&(a+=15,r.push("High variability in data"));break;case"correlation":const c=Math.abs(s.correlation||0);c>.8?(a+=30,r.push("Very strong correlation")):c>.6?(a+=20,r.push("Strong correlation")):c>.5&&(a+=10,r.push("Moderate correlation"));break;case"outlier":const o=(s.count||0)/(n.count||1);o>.05&&o<.2?(a+=25,r.push("Significant outliers detected")):o>0&&(a+=10,r.push("Some outliers present"));break;case"pattern":const h=(i=s.topPatterns)==null?void 0:i[0];if(h){const[,g]=h,y=g/n.count;y>.3&&y<.9&&(a+=20,r.push("Clear dominant pattern"))}break;case"trend":const f=s.strength||0;f>.5?(a+=30,r.push("Strong trend detected")):f>.3&&(a+=15,r.push("Moderate trend"));break}if(n.nullCount>0){const c=n.nullCount/n.count;c>.5?(a-=30,r.push("More than 50% missing data")):c>.2&&(a-=15,r.push("Significant missing data"))}return a=Math.max(0,Math.min(100,a)),{score:a,reasons:r}}async function As(e,t,s,n){console.log(`Starting analysis for dataset ${e}`);for(const r of s){const i=t.map(f=>f[r.name]),c=Rs(i,r.type),l=Ns(r.name,r.type,c),o=js(c,r.type),h=it("statistics",r.name,c,c);if(await n.prepare(`
      INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(e,"statistics",r.name,JSON.stringify(c),1,l,o,h.score).run(),r.type==="number"){const f=i.map(y=>Number(y)).filter(y=>!isNaN(y)),g=Os(f);if(g.indices.length>0){const y=`Found ${g.indices.length} unusual values in "${r.name}" (${(g.indices.length/f.length*100).toFixed(1)}% of data). These values are significantly different from the rest and might need attention.`,_={count:g.indices.length,indices:g.indices.slice(0,10)},x=it("outlier",r.name,_,c);await n.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(e,"outlier",r.name,JSON.stringify(_),.85,y,g.indices.length>f.length*.05?"high":"medium",x.score).run()}if(f.length>5){const y=Ts(f);if(y.direction!=="stable"){const _=`"${r.name}" shows a ${y.direction==="up"?"rising":"falling"} trend with ${(y.strength*100).toFixed(0)}% strength. This ${y.direction==="up"?"increase":"decrease"} is consistent across the dataset.`,x=it("trend",r.name,y,c);await n.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(e,"trend",r.name,JSON.stringify(y),y.strength,_,y.strength>.5?"high":"medium",x.score).run()}}}}const a=s.filter(r=>r.type==="number");for(let r=0;r<a.length;r++)for(let i=r+1;i<a.length;i++){const c=a[r],l=a[i],o=t.map(f=>Number(f[c.name])).filter(f=>!isNaN(f)),h=t.map(f=>Number(f[l.name])).filter(f=>!isNaN(f));if(o.length>5&&h.length>5){const f=ks(o,h);if(Math.abs(f)>.5){const g=Ds(c.name,l.name,f),y={column1:c.name,column2:l.name,correlation:f},_=it("correlation",void 0,y,{count:o.length});await n.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(e,"correlation",`${c.name}_vs_${l.name}`,JSON.stringify(y),Math.abs(f),g,Math.abs(f)>.7?"high":"medium",_.score).run()}}}for(const r of s)if(r.type==="string"){const i=t.map(h=>h[r.name]).filter(h=>h),c={};i.forEach(h=>{c[h]=(c[h]||0)+1});const o=Object.entries(c).sort((h,f)=>f[1]-h[1]).slice(0,5);if(o.length>0&&o[0][1]>i.length*.1){const h=`The most common value in "${r.name}" is "${o[0][0]}" appearing ${o[0][1]} times (${(o[0][1]/i.length*100).toFixed(1)}% of records).`,f={topPatterns:o},g={count:i.length,uniqueCount:new Set(i).size},y=it("pattern",r.name,f,g);await n.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(e,"pattern",r.name,JSON.stringify(f),.9,h,"medium",y.score).run()}}console.log(`Analysis complete for dataset ${e}`)}function Ns(e,t,s){var n,a,r,i;return t==="number"?`"${e}" ranges from ${(n=s.min)==null?void 0:n.toFixed(2)} to ${(a=s.max)==null?void 0:a.toFixed(2)} with an average of ${(r=s.mean)==null?void 0:r.toFixed(2)}. About half the values are below ${(i=s.median)==null?void 0:i.toFixed(2)}.`:`"${e}" contains ${s.count} values with ${s.uniqueCount} unique entries. Most common: "${s.mode}".`}function Ds(e,t,s){const n=Math.abs(s)>.7?"strong":"moderate";return s>0?`There's a ${n} relationship between "${e}" and "${t}": when ${e} increases, ${t} tends to increase too (correlation: ${s.toFixed(2)}).`:`There's a ${n} inverse relationship between "${e}" and "${t}": when ${e} increases, ${t} tends to decrease (correlation: ${s.toFixed(2)}).`}function js(e,t){return e.nullCount>e.count*.5?"high":e.uniqueCount===1?"low":t==="number"&&e.stdDev>e.mean?"high":"medium"}async function $s(e,t,s,n){console.log(`Generating visualizations for dataset ${e}`);const a=await n.prepare(`
    SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
  `).bind(e).all(),r=new Map;a.results.forEach(l=>{r.set(l.id_column,l.name_column)});let i=0;const c=[...s].sort((l,o)=>(o.quality_score||50)-(l.quality_score||50));for(const l of c){if((l.quality_score||50)<30){console.log(`Skipping low-quality visualization for ${l.column_name} (score: ${l.quality_score})`);continue}const o=await Is(l,t,r);o&&await n.prepare(`
        INSERT INTO visualizations (dataset_id, analysis_id, chart_type, title, config, explanation, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(e,l.id,o.chartType,o.title,JSON.stringify(o.config),o.explanation,i++).run()}console.log(`Generated ${i} visualizations`)}function Is(e,t,s){switch(e.analysis_type){case"statistics":return Ms(e,t,s);case"correlation":return qs(e,t,s);case"outlier":return Ps(e,t,s);case"pattern":return Ls(e,t,s);case"trend":return Fs(e,t,s);default:return null}}function Ms(e,t,s){const n=e.column_name;if(!n)return null;const a=e.result,r=s.has(n)?` (via ${s.get(n)})`:"";if(a.mean!==void 0){const o=t.map(f=>Number(f[n])).filter(f=>!isNaN(f)),h=Hs(o);return{chartType:"bar",title:`Distribution: ${n}${r}`,explanation:`This histogram shows how values in "${n}" are distributed${r?" using human-readable names":""}. Taller bars mean more data points at that value range.`,config:{type:"bar",data:{labels:h.labels,datasets:[{label:"Frequency",data:h.data,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`${n} Distribution`}},scales:{y:{beginAtZero:!0,title:{display:!0,text:"Count"}},x:{title:{display:!0,text:n}}}}}}}const i=t.map(o=>o[n]).filter(o=>o!=null),c={};i.forEach(o=>{c[String(o)]=(c[String(o)]||0)+1});const l=Object.entries(c).sort((o,h)=>h[1]-o[1]).slice(0,10);return{chartType:"bar",title:`Top Values: ${n}${r}`,explanation:`This chart shows the most common values in "${n}"${r?" using human-readable names":""}. The tallest bar is the most frequent value.`,config:{type:"bar",data:{labels:l.map(([o])=>o),datasets:[{label:"Count",data:l.map(([,o])=>o),backgroundColor:"rgba(16, 185, 129, 0.6)",borderColor:"rgba(16, 185, 129, 1)",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,indexAxis:"y",plugins:{legend:{display:!1},title:{display:!0,text:`Most Common: ${n}`}},scales:{x:{beginAtZero:!0,title:{display:!0,text:"Count"}}}}}}}function qs(e,t,s){const n=e.result,a=n.column1,r=n.column2;if(!a||!r)return null;const i=s.has(a)?` (via ${s.get(a)})`:"",c=s.has(r)?` (via ${s.get(r)})`:"",l=t.map(f=>({x:Number(f[a]),y:Number(f[r])})).filter(f=>!isNaN(f.x)&&!isNaN(f.y)),o=n.correlation,h=o>0?"rgba(139, 92, 246, 0.6)":"rgba(239, 68, 68, 0.6)";return{chartType:"scatter",title:`Relationship: ${a}${i} vs ${r}${c}`,explanation:`Each dot represents one record${i||c?" using human-readable names":""}. ${o>0?"The upward pattern shows they move together.":"The downward pattern shows they move in opposite directions."}`,config:{type:"scatter",data:{datasets:[{label:`${a} vs ${r}`,data:l,backgroundColor:h,borderColor:h.replace("0.6","1"),borderWidth:1,pointRadius:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`Correlation: ${o.toFixed(2)}`}},scales:{x:{title:{display:!0,text:a}},y:{title:{display:!0,text:r}}}}}}}function Ps(e,t,s){const n=e.column_name;if(!n)return null;const a=s.has(n)?` (via ${s.get(n)})`:"",r=new Set(e.result.indices||[]),i=t.map((o,h)=>({x:h,y:Number(o[n]),isOutlier:r.has(h)})).filter(o=>!isNaN(o.y)),c=i.filter(o=>!o.isOutlier),l=i.filter(o=>o.isOutlier);return{chartType:"scatter",title:`Outliers: ${n}${a}`,explanation:`Red dots are unusual values that stand out from the pattern${a?" (using human-readable names)":""}. Blue dots are normal values.`,config:{type:"scatter",data:{datasets:[{label:"Normal",data:c,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1,pointRadius:3},{label:"Outliers",data:l,backgroundColor:"rgba(239, 68, 68, 0.8)",borderColor:"rgba(239, 68, 68, 1)",borderWidth:2,pointRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"top"},title:{display:!0,text:`${n} - Outlier Detection`}},scales:{x:{title:{display:!0,text:"Record Index"}},y:{title:{display:!0,text:n}}}}}}}function Ls(e,t,s){const n=e.column_name;if(!n)return null;const a=s.has(n)?` (via ${s.get(n)})`:"",r=e.result.topPatterns||[];if(r.length===0)return null;const i=r.slice(0,8);return{chartType:"pie",title:`Pattern Distribution: ${n}${a}`,explanation:`Each slice shows what percentage of records have that value${a?" using human-readable names":""}. Bigger slices are more common.`,config:{type:"pie",data:{labels:i.map(([c])=>c),datasets:[{data:i.map(([,c])=>c),backgroundColor:["rgba(59, 130, 246, 0.8)","rgba(16, 185, 129, 0.8)","rgba(245, 158, 11, 0.8)","rgba(239, 68, 68, 0.8)","rgba(139, 92, 246, 0.8)","rgba(236, 72, 153, 0.8)","rgba(14, 165, 233, 0.8)","rgba(34, 197, 94, 0.8)"],borderWidth:2,borderColor:"#fff"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"right"},title:{display:!0,text:`${n} Breakdown`}}}}}}function Fs(e,t,s){const n=e.column_name;if(!n)return null;const a=s.has(n)?` (via ${s.get(n)})`:"",r=t.map(l=>Number(l[n])).filter(l=>!isNaN(l)),i=e.result,c=i.direction==="up"?"rgba(16, 185, 129, 0.6)":"rgba(239, 68, 68, 0.6)";return{chartType:"line",title:`Trend: ${n}${a}`,explanation:`This line shows how "${n}" changes over time${a?" using human-readable names":""}. ${i.direction==="up"?"The upward slope indicates growth.":"The downward slope indicates decline."}`,config:{type:"line",data:{labels:r.map((l,o)=>`#${o+1}`),datasets:[{label:n,data:r,backgroundColor:c,borderColor:c.replace("0.6","1"),borderWidth:2,fill:!1,tension:.3}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`${n} Over Time (${i.direction==="up"?"↗":"↘"} ${Math.round(i.strength*100)}% strength)`}},scales:{x:{title:{display:!0,text:"Record Number"}},y:{title:{display:!0,text:n}}}}}}}function Hs(e,t=10){if(e.length===0)return{labels:[],data:[]};const s=Math.min(...e),r=(Math.max(...e)-s)/t,i=new Array(t).fill(0),c=[];for(let l=0;l<t;l++){const o=s+l*r,h=s+(l+1)*r;c.push(`${o.toFixed(1)}-${h.toFixed(1)}`)}return e.forEach(l=>{let o=Math.floor((l-s)/r);o>=t&&(o=t-1),o<0&&(o=0),i[o]++}),{labels:c,data:i}}const _n=new qe;_n.post("/:id",async e=>{try{const t=Number(e.req.param("id")),s=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!s)return e.json({error:"Dataset not found"},404);let a=(await e.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0
    `).bind(t).all()).results.map(o=>JSON.parse(o.data));const r=JSON.parse(s.columns),i=await e.env.DB.prepare(`
      SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
    `).bind(t).all();if(i.results.length>0){const o=i.results.map(h=>({id_column:h.id_column,name_column:h.name_column,confidence:1}));console.log(`Applying ${o.length} column mappings for human-readable analysis...`),a=Es(a,o);for(const h of o){const f=r.find(g=>g.name===h.id_column);f&&(f.enriched_by=h.name_column)}}await As(t,a,r,e.env.DB);const l=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(t).all()).results.map(o=>({...o,result:JSON.parse(o.result)}));return await $s(t,a,l,e.env.DB),await e.env.DB.prepare(`
      UPDATE datasets SET analysis_status = ?, visualization_status = ?
      WHERE id = ?
    `).bind("complete","complete",t).run(),e.json({success:!0,message:"Analysis complete",analyses_count:l.length,dataset_id:t})}catch(t){return console.error("Analysis error:",t),e.json({error:"Analysis failed: "+t.message},500)}});const xn=new qe;xn.get("/:id",async e=>{try{const t=e.req.param("id"),s=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!s)return e.json({error:"Dataset not found"},404);const n=JSON.parse(s.columns),r=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(t).all()).results.map(g=>({...g,result:JSON.parse(g.result)})),i=[],c=[],l=new Map;for(const g of n){const y=`col_${g.name}`;if(!l.has(y)){const x=10+g.unique_count/s.row_count*30;i.push({id:y,label:g.name,type:"column",size:x}),l.set(y,!0)}}const o=r.filter(g=>g.analysis_type==="correlation"),h=o.sort((g,y)=>Math.abs(y.result.correlation)-Math.abs(g.result.correlation)).slice(0,Math.min(50,o.length));for(const g of h){const{column1:y,column2:_,correlation:x}=g.result,j=`col_${y}`,L=`col_${_}`;n.length>50&&Math.abs(x)<.7||c.push({source:j,target:L,type:"correlation",strength:Math.abs(x),label:`${x>0?"+":""}${x.toFixed(2)}`})}const f=r.filter(g=>g.analysis_type==="pattern"&&(g.quality_score||0)>50);for(const g of f){const y=g.column_name;if(!y)continue;const{topPatterns:_}=g.result;if(!_||_.length===0)continue;const x=_.slice(0,3);for(const[j,L]of x){const se=`val_${y}_${j}`;l.has(se)||(i.push({id:se,label:String(j),type:"value",size:5+L/s.row_count*20}),l.set(se,!0)),c.push({source:`col_${y}`,target:se,type:"contains",strength:L/s.row_count,label:`${L}x`})}}return e.json({nodes:i,edges:c,dataset_name:s.name})}catch(t){return console.error("Relationship graph error:",t),e.json({error:"Failed to generate relationship graph"},500)}});const St=new qe;St.get("/:datasetId",async e=>{try{const t=e.req.param("datasetId"),s=await e.env.DB.prepare(`
      SELECT * FROM column_mappings WHERE dataset_id = ? ORDER BY id_column
    `).bind(t).all();return e.json({mappings:s.results})}catch(t){return console.error("Mappings fetch error:",t),e.json({error:"Failed to fetch mappings"},500)}});St.delete("/:id",async e=>{try{const t=e.req.param("id");return await e.env.DB.prepare(`
      DELETE FROM column_mappings WHERE id = ?
    `).bind(t).run(),e.json({success:!0})}catch(t){return console.error("Mapping delete error:",t),e.json({error:"Failed to delete mapping"},500)}});St.post("/",async e=>{try{const{dataset_id:t,id_column:s,name_column:n}=await e.req.json();return await e.env.DB.prepare(`
      INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
      VALUES (?, ?, ?, 0)
    `).bind(t,s,n).run(),e.json({success:!0})}catch(t){return console.error("Mapping create error:",t),e.json({error:"Failed to create mapping"},500)}});const wn=new qe,Bt=[{type:"function",function:{name:"get_outlier_columns",description:"Get a list of all columns that have outliers detected, with counts and percentages",parameters:{type:"object",properties:{min_outlier_count:{type:"number",description:"Minimum number of outliers to include (optional, default: 1)"}}}}},{type:"function",function:{name:"get_correlation_analysis",description:"Get correlation analysis between columns, optionally filtered by minimum correlation strength",parameters:{type:"object",properties:{min_correlation:{type:"number",description:"Minimum absolute correlation value to include (0-1, optional, default: 0.5)"},column_name:{type:"string",description:"Specific column to get correlations for (optional)"}}}}},{type:"function",function:{name:"get_column_statistics",description:"Get detailed statistics for a specific column including mean, median, mode, outliers, etc.",parameters:{type:"object",properties:{column_name:{type:"string",description:"Name of the column to analyze"}},required:["column_name"]}}},{type:"function",function:{name:"search_analyses",description:"Search all analyses by type or keyword",parameters:{type:"object",properties:{analysis_type:{type:"string",description:"Type of analysis to filter (outlier, correlation, pattern, summary, etc.)",enum:["outlier","correlation","pattern","summary","missing","distribution"]},keyword:{type:"string",description:"Keyword to search in explanations (optional)"}}}}},{type:"function",function:{name:"get_data_sample",description:"Get a sample of actual data rows from the dataset",parameters:{type:"object",properties:{limit:{type:"number",description:"Number of rows to return (default: 5, max: 20)"},columns:{type:"array",items:{type:"string"},description:"Specific columns to include (optional)"}}}}},{type:"function",function:{name:"get_missing_values",description:"Get information about missing values in the dataset",parameters:{type:"object",properties:{min_missing_percentage:{type:"number",description:"Minimum percentage of missing values to include (optional, default: 0)"}}}}},{type:"function",function:{name:"suggest_data_cleaning",description:"Get data cleaning suggestions for a specific column or the entire dataset",parameters:{type:"object",properties:{column_name:{type:"string",description:"Specific column to analyze (optional, analyzes entire dataset if not provided)"}}}}}];async function zs(e,t,s){const n=s.min_outlier_count||1,r=(await e.prepare(`
    SELECT column_name, result, explanation, quality_score
    FROM analyses 
    WHERE dataset_id = ? AND analysis_type = 'outlier'
    ORDER BY quality_score DESC
  `).bind(t).all()).results.map(i=>{const c=JSON.parse(i.result);return{column:i.column_name,count:c.count||0,percentage:c.percentage||0,explanation:i.explanation,quality_score:i.quality_score}}).filter(i=>i.count>=n);return{total_columns_with_outliers:r.length,outliers:r}}async function Bs(e,t,s){const n=s.min_correlation||.5,a=s.column_name;let r=`
    SELECT column_name, result, explanation, quality_score
    FROM analyses 
    WHERE dataset_id = ? AND analysis_type = 'correlation'
  `;a&&(r+=` AND column_name LIKE '%${a}%'`),r+=" ORDER BY quality_score DESC";const c=(await e.prepare(r).bind(t).all()).results.map(l=>{const o=JSON.parse(l.result);return{column:l.column_name,correlation:o.correlation||0,target_column:o.target_column||"unknown",explanation:l.explanation,quality_score:l.quality_score}}).filter(l=>Math.abs(l.correlation)>=n);return{total_correlations:c.length,correlations:c}}async function Us(e,t,s){const n=s.column_name,a=await e.prepare(`
    SELECT analysis_type, column_name, result, explanation, importance, confidence, quality_score
    FROM analyses 
    WHERE dataset_id = ? AND column_name = ?
    ORDER BY quality_score DESC
  `).bind(t,n).all();if(a.results.length===0)return{error:`No analysis found for column: ${n}`};const r={column:n,analyses:[]};return a.results.forEach(i=>{r.analyses.push({type:i.analysis_type,result:JSON.parse(i.result),explanation:i.explanation,importance:i.importance,confidence:i.confidence,quality_score:i.quality_score})}),r}async function Ws(e,t,s){const n=s.analysis_type,a=s.keyword;let r=`
    SELECT analysis_type, column_name, result, explanation, quality_score
    FROM analyses 
    WHERE dataset_id = ?
  `;const i=[t];n&&(r+=" AND analysis_type = ?",i.push(n)),a&&(r+=" AND explanation LIKE ?",i.push(`%${a}%`)),r+=" ORDER BY quality_score DESC LIMIT 50";const c=await e.prepare(r).bind(...i).all();return{total_found:c.results.length,analyses:c.results.map(l=>({type:l.analysis_type,column:l.column_name,result:JSON.parse(l.result),explanation:l.explanation,quality_score:l.quality_score}))}}async function Js(e,t,s){const n=Math.min(s.limit||5,20),a=s.columns,i=(await e.prepare(`
    SELECT data FROM data_rows 
    WHERE dataset_id = ? 
    ORDER BY row_number 
    LIMIT ?
  `).bind(t,n).all()).results.map(c=>JSON.parse(c.data));return a&&a.length>0?{rows:i.map(c=>{const l={};return a.forEach(o=>{c.hasOwnProperty(o)&&(l[o]=c[o])}),l}),row_count:i.length}:{rows:i,row_count:i.length}}async function Vs(e,t,s){const n=s.min_missing_percentage||0,r=(await e.prepare(`
    SELECT analysis_type, column_name, result, explanation
    FROM analyses 
    WHERE dataset_id = ? AND analysis_type = 'missing'
  `).bind(t).all()).results.map(i=>{const c=JSON.parse(i.result);return{column:i.column_name,count:c.count||0,percentage:c.percentage||0,explanation:i.explanation}}).filter(i=>i.percentage>=n);return{total_columns_with_missing:r.length,missing_values:r}}async function Ks(e,t,s){const n=s.column_name;let a=`
    SELECT analysis_type, column_name, result, explanation
    FROM analyses 
    WHERE dataset_id = ?
  `;const r=[t];n&&(a+=" AND column_name = ?",r.push(n));const i=await e.prepare(a).bind(...r).all(),c=[];return i.results.forEach(l=>{const o=JSON.parse(l.result),h=l.analysis_type;h==="outlier"&&o.count>0&&c.push({column:l.column_name,issue:"outliers",severity:o.percentage>10?"high":"medium",suggestion:`Remove or cap ${o.count} outlier values (${o.percentage}% of data)`,details:l.explanation}),h==="missing"&&o.count>0&&c.push({column:l.column_name,issue:"missing_values",severity:o.percentage>20?"high":o.percentage>5?"medium":"low",suggestion:`Handle ${o.count} missing values (${o.percentage}%). Consider imputation or removal.`,details:l.explanation}),h==="pattern"&&o.mode_frequency>80&&c.push({column:l.column_name,issue:"low_variance",severity:"low",suggestion:`Column has very low variance (${o.mode_frequency}% same value). Consider removing if not meaningful.`,details:l.explanation})}),{total_suggestions:c.length,suggestions:c.sort((l,o)=>{const h={high:3,medium:2,low:1};return(h[o.severity]||0)-(h[l.severity]||0)})}}wn.post("/:datasetId",async e=>{var t;try{const s=e.req.param("datasetId"),{message:n,conversationHistory:a=[]}=await e.req.json(),r=e.env.OPENAI_API_KEY;if(!r||r.includes("your-openai-api-key"))return e.json({error:"OpenAI API key not configured",message:ot(n)},500);const i=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(s).first();if(!i)return e.json({error:"Dataset not found"},404);const c=JSON.parse(i.columns),o=[{role:"system",content:`You are a data analysis assistant helping users understand their dataset.

Dataset: ${i.name}
Rows: ${i.row_count}
Columns: ${i.column_count}

Available columns: ${c.slice(0,50).map(x=>x.name).join(", ")}${c.length>50?`, ... and ${c.length-50} more`:""}

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

When users ask questions, use the appropriate tools to get actual data.`},...a,{role:"user",content:n}],h=e.env.OPENAI_MODEL||"gpt-4o-mini";console.log(`Calling OpenAI API with model: ${h} and ${Bt.length} tools`);let f="",g=[...o];const y=[];for(let x=0;x<5;x++){const j=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r}`},body:JSON.stringify({model:h,messages:g,tools:Bt,tool_choice:"auto",max_tokens:1500,temperature:.7})}),L=await j.text();if(!j.ok)return console.error("OpenAI API error status:",j.status),console.error("OpenAI API error response:",L),e.json({error:"Failed to get response from OpenAI",message:ot(n)},500);const se=JSON.parse(L),pe=(t=se.choices)==null?void 0:t[0];if(!pe)return console.error("No choice in OpenAI response:",se),e.json({error:"Empty response from OpenAI",message:ot(n)},500);const J=pe.message;if(J.tool_calls&&J.tool_calls.length>0){console.log(`Tool calls requested: ${J.tool_calls.length}`),g.push(J);for(const fe of J.tool_calls){const Z=fe.function.name,O=JSON.parse(fe.function.arguments);y.push({name:Z,args:O}),console.log(`Executing tool: ${Z}`,O);let u;try{switch(Z){case"get_outlier_columns":u=await zs(e.env.DB,s,O);break;case"get_correlation_analysis":u=await Bs(e.env.DB,s,O);break;case"get_column_statistics":u=await Us(e.env.DB,s,O);break;case"search_analyses":u=await Ws(e.env.DB,s,O);break;case"get_data_sample":u=await Js(e.env.DB,s,O);break;case"get_missing_values":u=await Vs(e.env.DB,s,O);break;case"suggest_data_cleaning":u=await Ks(e.env.DB,s,O);break;default:u={error:`Unknown function: ${Z}`}}}catch(d){console.error(`Tool execution error for ${Z}:`,d),u={error:`Failed to execute ${Z}: ${d}`}}g.push({role:"tool",tool_call_id:fe.id,content:JSON.stringify(u)})}continue}f=J.content||"";break}if(!f)return e.json({error:"No final response from OpenAI",message:ot(n)},500);const _=Gs(n,[]);return e.json({message:f,suggestions:_,tool_calls:y})}catch(s){console.error("Chat error:",s);const n=s instanceof Error?s.message:String(s);return e.json({error:"Chat failed: "+n,message:ot("error")},500)}});function Gs(e,t){const s=e.toLowerCase(),n=[];return s.includes("outlier")?(n.push("How should I clean the outliers?"),n.push("Show me correlations between outlier columns")):s.includes("correlat")?(n.push("Which columns have the most outliers?"),n.push("Show me a data sample")):s.includes("clean")?(n.push("Show me missing values"),n.push("What are the biggest data quality issues?")):(n.push("Which columns have outliers?"),n.push("Suggest data cleaning steps"),n.push("Show me the strongest correlations")),n.slice(0,3)}function ot(e){const t=e.toLowerCase();return t.includes("outlier")?"To see outliers, go to the 'Insights' tab and search for 'outlier'.":t.includes("correlat")?"Check the 'Insights' tab and search for 'correlation'.":"I'm currently operating in fallback mode. Please configure your OpenAI API key."}const ve=new qe;ve.use("/api/*",ss());ve.use("/static/*",ps({root:"./public"}));ve.route("/api/upload",vn);ve.route("/api/datasets",nt);ve.route("/api/analyze",_n);ve.route("/api/relationships",xn);ve.route("/api/mappings",St);ve.route("/api/chat",wn);ve.get("/api/health",e=>e.json({status:"ok",timestamp:new Date().toISOString()}));ve.get("/",e=>e.html(`
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
  `));const Ut=new qe,Ys=Object.assign({"/src/index.tsx":ve});let En=!1;for(const[,e]of Object.entries(Ys))e&&(Ut.all("*",t=>{let s;try{s=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,s)}),Ut.notFound(t=>{let s;try{s=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,s)}),En=!0);if(!En)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{Ut as default};
