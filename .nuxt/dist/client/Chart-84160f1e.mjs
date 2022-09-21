import{S as tt,f as de,g as ye,i as Yn,h as et,j as rt,k as pe,_ as Me,l as ve,m as it,p as Te,q as _e,s as we,o as ut,c as ot,b as xe,t as Ce}from"./entry-50e32e66.mjs";function pn(n,t){return n==null||t==null?NaN:n<t?-1:n>t?1:n>=t?0:NaN}function ke(n,t){return n==null||t==null?NaN:t<n?-1:t>n?1:t>=n?0:NaN}function Vn(n){let t,e,r;n.length!==2?(t=pn,e=(a,c)=>pn(n(a),c),r=(a,c)=>n(a)-c):(t=n===pn||n===ke?n:Ue,e=n,r=n);function u(a,c,s=0,f=a.length){if(s<f){if(t(c,c)!==0)return f;do{const h=s+f>>>1;e(a[h],c)<0?s=h+1:f=h}while(s<f)}return s}function i(a,c,s=0,f=a.length){if(s<f){if(t(c,c)!==0)return f;do{const h=s+f>>>1;e(a[h],c)<=0?s=h+1:f=h}while(s<f)}return s}function o(a,c,s=0,f=a.length){const h=u(a,c,s,f-1);return h>s&&r(a[h-1],c)>-r(a[h],c)?h-1:h}return{left:u,center:o,right:i}}function Ue(){return 0}function Se(n){return n===null?NaN:+n}const De=Vn(pn),Fe=De.right;Vn(Se).center;var be=Fe;function Ae(n,t){let e,r;if(t===void 0)for(const u of n)u!=null&&(e===void 0?u>=u&&(e=r=u):(e>u&&(e=u),r<u&&(r=u)));else{let u=-1;for(let i of n)(i=t(i,++u,n))!=null&&(e===void 0?i>=i&&(e=r=i):(e>i&&(e=i),r<i&&(r=i)))}return[e,r]}var Hn=Math.sqrt(50),Ln=Math.sqrt(10),Wn=Math.sqrt(2);function Ne(n,t,e){var r,u=-1,i,o,a;if(t=+t,n=+n,e=+e,n===t&&e>0)return[n];if((r=t<n)&&(i=n,n=t,t=i),(a=St(n,t,e))===0||!isFinite(a))return[];if(a>0){let c=Math.round(n/a),s=Math.round(t/a);for(c*a<n&&++c,s*a>t&&--s,o=new Array(i=s-c+1);++u<i;)o[u]=(c+u)*a}else{a=-a;let c=Math.round(n*a),s=Math.round(t*a);for(c/a<n&&++c,s/a>t&&--s,o=new Array(i=s-c+1);++u<i;)o[u]=(c+u)/a}return r&&o.reverse(),o}function St(n,t,e){var r=(t-n)/Math.max(0,e),u=Math.floor(Math.log(r)/Math.LN10),i=r/Math.pow(10,u);return u>=0?(i>=Hn?10:i>=Ln?5:i>=Wn?2:1)*Math.pow(10,u):-Math.pow(10,-u)/(i>=Hn?10:i>=Ln?5:i>=Wn?2:1)}function Pn(n,t,e){var r=Math.abs(t-n)/Math.max(0,e),u=Math.pow(10,Math.floor(Math.log(r)/Math.LN10)),i=r/u;return i>=Hn?u*=10:i>=Ln?u*=5:i>=Wn&&(u*=2),t<n?-u:u}function Ye(n,t){let e;if(t===void 0)for(const r of n)r!=null&&(e<r||e===void 0&&r>=r)&&(e=r);else{let r=-1;for(let u of n)(u=t(u,++r,n))!=null&&(e<u||e===void 0&&u>=u)&&(e=u)}return e}function He(n){return n}var Un=1,Sn=2,zn=3,mn=4,at=1e-6;function Le(n){return"translate("+n+",0)"}function We(n){return"translate(0,"+n+")"}function Pe(n){return t=>+n(t)}function ze(n,t){return t=Math.max(0,n.bandwidth()-t*2)/2,n.round()&&(t=Math.round(t)),e=>+n(e)+t}function Oe(){return!this.__axis}function Dt(n,t){var e=[],r=null,u=null,i=6,o=6,a=3,c=typeof window!="undefined"&&window.devicePixelRatio>1?0:.5,s=n===Un||n===mn?-1:1,f=n===mn||n===Sn?"x":"y",h=n===Un||n===zn?Le:We;function l(g){var _=r==null?t.ticks?t.ticks.apply(t,e):t.domain():r,S=u==null?t.tickFormat?t.tickFormat.apply(t,e):He:u,k=Math.max(i,0)+a,D=t.range(),b=+D[0]+c,w=+D[D.length-1]+c,F=(t.bandwidth?ze:Pe)(t.copy(),c),U=g.selection?g.selection():g,y=U.selectAll(".domain").data([null]),x=U.selectAll(".tick").data(_,t).order(),I=x.exit(),j=x.enter().append("g").attr("class","tick"),B=x.select("line"),p=x.select("text");y=y.merge(y.enter().insert("path",".tick").attr("class","domain").attr("stroke","currentColor")),x=x.merge(j),B=B.merge(j.append("line").attr("stroke","currentColor").attr(f+"2",s*i)),p=p.merge(j.append("text").attr("fill","currentColor").attr(f,s*k).attr("dy",n===Un?"0em":n===zn?"0.71em":"0.32em")),g!==U&&(y=y.transition(g),x=x.transition(g),B=B.transition(g),p=p.transition(g),I=I.transition(g).attr("opacity",at).attr("transform",function(N){return isFinite(N=F(N))?h(N+c):this.getAttribute("transform")}),j.attr("opacity",at).attr("transform",function(N){var A=this.parentNode.__axis;return h((A&&isFinite(A=A(N))?A:F(N))+c)})),I.remove(),y.attr("d",n===mn||n===Sn?o?"M"+s*o+","+b+"H"+c+"V"+w+"H"+s*o:"M"+c+","+b+"V"+w:o?"M"+b+","+s*o+"V"+c+"H"+w+"V"+s*o:"M"+b+","+c+"H"+w),x.attr("opacity",1).attr("transform",function(N){return h(F(N)+c)}),B.attr(f+"2",s*i),p.attr(f,s*k).text(S),U.filter(Oe).attr("fill","none").attr("font-size",10).attr("font-family","sans-serif").attr("text-anchor",n===Sn?"start":n===mn?"end":"middle"),U.each(function(){this.__axis=F})}return l.scale=function(g){return arguments.length?(t=g,l):t},l.ticks=function(){return e=Array.from(arguments),l},l.tickArguments=function(g){return arguments.length?(e=g==null?[]:Array.from(g),l):e.slice()},l.tickValues=function(g){return arguments.length?(r=g==null?null:Array.from(g),l):r&&r.slice()},l.tickFormat=function(g){return arguments.length?(u=g,l):u},l.tickSize=function(g){return arguments.length?(i=o=+g,l):i},l.tickSizeInner=function(g){return arguments.length?(i=+g,l):i},l.tickSizeOuter=function(g){return arguments.length?(o=+g,l):o},l.tickPadding=function(g){return arguments.length?(a=+g,l):a},l.offset=function(g){return arguments.length?(c=+g,l):c},l}function Ie(n){return Dt(zn,n)}function Ee(n){return Dt(mn,n)}function Be(n){return typeof n=="string"?new tt([[document.querySelector(n)]],[document.documentElement]):new tt([[n]],de)}function Ze(n,t){t||(t=[]);var e=n?Math.min(t.length,n.length):0,r=t.slice(),u;return function(i){for(u=0;u<e;++u)r[u]=n[u]*(1-i)+t[u]*i;return r}}function Ve(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function je(n,t){var e=t?t.length:0,r=n?Math.min(e,n.length):0,u=new Array(r),i=new Array(e),o;for(o=0;o<r;++o)u[o]=xn(n[o],t[o]);for(;o<e;++o)i[o]=t[o];return function(a){for(o=0;o<r;++o)i[o]=u[o](a);return i}}function Re(n,t){var e=new Date;return n=+n,t=+t,function(r){return e.setTime(n*(1-r)+t*r),e}}function $e(n,t){var e={},r={},u;(n===null||typeof n!="object")&&(n={}),(t===null||typeof t!="object")&&(t={});for(u in t)u in n?e[u]=xn(n[u],t[u]):r[u]=t[u];return function(i){for(u in e)r[u]=e[u](i);return r}}function xn(n,t){var e=typeof t,r;return t==null||e==="boolean"?ye(t):(e==="number"?Yn:e==="string"?(r=et(t))?(t=r,rt):pe:t instanceof et?rt:t instanceof Date?Re:Ve(t)?Ze:Array.isArray(t)?je:typeof t.valueOf!="function"&&typeof t.toString!="function"||isNaN(t)?$e:Yn)(n,t)}function qe(n,t){return n=+n,t=+t,function(e){return Math.round(n*(1-e)+t*e)}}const On=Math.PI,In=2*On,X=1e-6,Xe=In-X;function En(){this._x0=this._y0=this._x1=this._y1=null,this._=""}function jn(){return new En}En.prototype=jn.prototype={constructor:En,moveTo:function(n,t){this._+="M"+(this._x0=this._x1=+n)+","+(this._y0=this._y1=+t)},closePath:function(){this._x1!==null&&(this._x1=this._x0,this._y1=this._y0,this._+="Z")},lineTo:function(n,t){this._+="L"+(this._x1=+n)+","+(this._y1=+t)},quadraticCurveTo:function(n,t,e,r){this._+="Q"+ +n+","+ +t+","+(this._x1=+e)+","+(this._y1=+r)},bezierCurveTo:function(n,t,e,r,u,i){this._+="C"+ +n+","+ +t+","+ +e+","+ +r+","+(this._x1=+u)+","+(this._y1=+i)},arcTo:function(n,t,e,r,u){n=+n,t=+t,e=+e,r=+r,u=+u;var i=this._x1,o=this._y1,a=e-n,c=r-t,s=i-n,f=o-t,h=s*s+f*f;if(u<0)throw new Error("negative radius: "+u);if(this._x1===null)this._+="M"+(this._x1=n)+","+(this._y1=t);else if(h>X)if(!(Math.abs(f*a-c*s)>X)||!u)this._+="L"+(this._x1=n)+","+(this._y1=t);else{var l=e-i,g=r-o,_=a*a+c*c,S=l*l+g*g,k=Math.sqrt(_),D=Math.sqrt(h),b=u*Math.tan((On-Math.acos((_+h-S)/(2*k*D)))/2),w=b/D,F=b/k;Math.abs(w-1)>X&&(this._+="L"+(n+w*s)+","+(t+w*f)),this._+="A"+u+","+u+",0,0,"+ +(f*l>s*g)+","+(this._x1=n+F*a)+","+(this._y1=t+F*c)}},arc:function(n,t,e,r,u,i){n=+n,t=+t,e=+e,i=!!i;var o=e*Math.cos(r),a=e*Math.sin(r),c=n+o,s=t+a,f=1^i,h=i?r-u:u-r;if(e<0)throw new Error("negative radius: "+e);this._x1===null?this._+="M"+c+","+s:(Math.abs(this._x1-c)>X||Math.abs(this._y1-s)>X)&&(this._+="L"+c+","+s),e&&(h<0&&(h=h%In+In),h>Xe?this._+="A"+e+","+e+",0,1,"+f+","+(n-o)+","+(t-a)+"A"+e+","+e+",0,1,"+f+","+(this._x1=c)+","+(this._y1=s):h>X&&(this._+="A"+e+","+e+",0,"+ +(h>=On)+","+f+","+(this._x1=n+e*Math.cos(u))+","+(this._y1=t+e*Math.sin(u))))},rect:function(n,t,e,r){this._+="M"+(this._x0=this._x1=+n)+","+(this._y0=this._y1=+t)+"h"+ +e+"v"+ +r+"h"+-e+"Z"},toString:function(){return this._}};function Qe(n){return Math.abs(n=Math.round(n))>=1e21?n.toLocaleString("en").replace(/,/g,""):n.toString(10)}function Mn(n,t){if((e=(n=t?n.toExponential(t-1):n.toExponential()).indexOf("e"))<0)return null;var e,r=n.slice(0,e);return[r.length>1?r[0]+r.slice(2):r,+n.slice(e+1)]}function on(n){return n=Mn(Math.abs(n)),n?n[1]:NaN}function Ge(n,t){return function(e,r){for(var u=e.length,i=[],o=0,a=n[0],c=0;u>0&&a>0&&(c+a+1>r&&(a=Math.max(1,r-c)),i.push(e.substring(u-=a,u+a)),!((c+=a+1)>r));)a=n[o=(o+1)%n.length];return i.reverse().join(t)}}function Je(n){return function(t){return t.replace(/[0-9]/g,function(e){return n[+e]})}}var Ke=/^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;function vn(n){if(!(t=Ke.exec(n)))throw new Error("invalid format: "+n);var t;return new Rn({fill:t[1],align:t[2],sign:t[3],symbol:t[4],zero:t[5],width:t[6],comma:t[7],precision:t[8]&&t[8].slice(1),trim:t[9],type:t[10]})}vn.prototype=Rn.prototype;function Rn(n){this.fill=n.fill===void 0?" ":n.fill+"",this.align=n.align===void 0?">":n.align+"",this.sign=n.sign===void 0?"-":n.sign+"",this.symbol=n.symbol===void 0?"":n.symbol+"",this.zero=!!n.zero,this.width=n.width===void 0?void 0:+n.width,this.comma=!!n.comma,this.precision=n.precision===void 0?void 0:+n.precision,this.trim=!!n.trim,this.type=n.type===void 0?"":n.type+""}Rn.prototype.toString=function(){return this.fill+this.align+this.sign+this.symbol+(this.zero?"0":"")+(this.width===void 0?"":Math.max(1,this.width|0))+(this.comma?",":"")+(this.precision===void 0?"":"."+Math.max(0,this.precision|0))+(this.trim?"~":"")+this.type};function nr(n){n:for(var t=n.length,e=1,r=-1,u;e<t;++e)switch(n[e]){case".":r=u=e;break;case"0":r===0&&(r=e),u=e;break;default:if(!+n[e])break n;r>0&&(r=0);break}return r>0?n.slice(0,r)+n.slice(u+1):n}var Ft;function tr(n,t){var e=Mn(n,t);if(!e)return n+"";var r=e[0],u=e[1],i=u-(Ft=Math.max(-8,Math.min(8,Math.floor(u/3)))*3)+1,o=r.length;return i===o?r:i>o?r+new Array(i-o+1).join("0"):i>0?r.slice(0,i)+"."+r.slice(i):"0."+new Array(1-i).join("0")+Mn(n,Math.max(0,t+i-1))[0]}function ct(n,t){var e=Mn(n,t);if(!e)return n+"";var r=e[0],u=e[1];return u<0?"0."+new Array(-u).join("0")+r:r.length>u+1?r.slice(0,u+1)+"."+r.slice(u+1):r+new Array(u-r.length+2).join("0")}var ft={"%":(n,t)=>(n*100).toFixed(t),b:n=>Math.round(n).toString(2),c:n=>n+"",d:Qe,e:(n,t)=>n.toExponential(t),f:(n,t)=>n.toFixed(t),g:(n,t)=>n.toPrecision(t),o:n=>Math.round(n).toString(8),p:(n,t)=>ct(n*100,t),r:ct,s:tr,X:n=>Math.round(n).toString(16).toUpperCase(),x:n=>Math.round(n).toString(16)};function st(n){return n}var lt=Array.prototype.map,ht=["y","z","a","f","p","n","\xB5","m","","k","M","G","T","P","E","Z","Y"];function er(n){var t=n.grouping===void 0||n.thousands===void 0?st:Ge(lt.call(n.grouping,Number),n.thousands+""),e=n.currency===void 0?"":n.currency[0]+"",r=n.currency===void 0?"":n.currency[1]+"",u=n.decimal===void 0?".":n.decimal+"",i=n.numerals===void 0?st:Je(lt.call(n.numerals,String)),o=n.percent===void 0?"%":n.percent+"",a=n.minus===void 0?"\u2212":n.minus+"",c=n.nan===void 0?"NaN":n.nan+"";function s(h){h=vn(h);var l=h.fill,g=h.align,_=h.sign,S=h.symbol,k=h.zero,D=h.width,b=h.comma,w=h.precision,F=h.trim,U=h.type;U==="n"?(b=!0,U="g"):ft[U]||(w===void 0&&(w=12),F=!0,U="g"),(k||l==="0"&&g==="=")&&(k=!0,l="0",g="=");var y=S==="$"?e:S==="#"&&/[boxX]/.test(U)?"0"+U.toLowerCase():"",x=S==="$"?r:/[%p]/.test(U)?o:"",I=ft[U],j=/[defgprs%]/.test(U);w=w===void 0?6:/[gprs]/.test(U)?Math.max(1,Math.min(21,w)):Math.max(0,Math.min(20,w));function B(p){var N=y,A=x,R,dn,nn;if(U==="c")A=I(p)+A,p="";else{p=+p;var tn=p<0||1/p<0;if(p=isNaN(p)?c:I(Math.abs(p),w),F&&(p=nr(p)),tn&&+p==0&&_!=="+"&&(tn=!1),N=(tn?_==="("?_:a:_==="-"||_==="("?"":_)+N,A=(U==="s"?ht[8+Ft/3]:"")+A+(tn&&_==="("?")":""),j){for(R=-1,dn=p.length;++R<dn;)if(nn=p.charCodeAt(R),48>nn||nn>57){A=(nn===46?u+p.slice(R+1):p.slice(R))+A,p=p.slice(0,R);break}}}b&&!k&&(p=t(p,1/0));var en=N.length+p.length+A.length,E=en<D?new Array(D-en+1).join(l):"";switch(b&&k&&(p=t(E+p,E.length?D-A.length:1/0),E=""),g){case"<":p=N+p+A+E;break;case"=":p=N+E+p+A;break;case"^":p=E.slice(0,en=E.length>>1)+N+p+A+E.slice(en);break;default:p=E+N+p+A;break}return i(p)}return B.toString=function(){return h+""},B}function f(h,l){var g=s((h=vn(h),h.type="f",h)),_=Math.max(-8,Math.min(8,Math.floor(on(l)/3)))*3,S=Math.pow(10,-_),k=ht[8+_/3];return function(D){return g(S*D)+k}}return{format:s,formatPrefix:f}}var yn,$n,bt;rr({thousands:",",grouping:[3],currency:["$",""]});function rr(n){return yn=er(n),$n=yn.format,bt=yn.formatPrefix,yn}function ir(n){return Math.max(0,-on(Math.abs(n)))}function ur(n,t){return Math.max(0,Math.max(-8,Math.min(8,Math.floor(on(t)/3)))*3-on(Math.abs(n)))}function or(n,t){return n=Math.abs(n),t=Math.abs(t)-n,Math.max(0,on(t)-on(n))+1}function At(n,t){switch(arguments.length){case 0:break;case 1:this.range(n);break;default:this.range(t).domain(n);break}return this}function ar(n){return function(){return n}}function cr(n){return+n}var mt=[0,1];function un(n){return n}function Bn(n,t){return(t-=n=+n)?function(e){return(e-n)/t}:ar(isNaN(t)?NaN:.5)}function fr(n,t){var e;return n>t&&(e=n,n=t,t=e),function(r){return Math.max(n,Math.min(t,r))}}function sr(n,t,e){var r=n[0],u=n[1],i=t[0],o=t[1];return u<r?(r=Bn(u,r),i=e(o,i)):(r=Bn(r,u),i=e(i,o)),function(a){return i(r(a))}}function lr(n,t,e){var r=Math.min(n.length,t.length)-1,u=new Array(r),i=new Array(r),o=-1;for(n[r]<n[0]&&(n=n.slice().reverse(),t=t.slice().reverse());++o<r;)u[o]=Bn(n[o],n[o+1]),i[o]=e(t[o],t[o+1]);return function(a){var c=be(n,a,1,r)-1;return i[c](u[c](a))}}function Nt(n,t){return t.domain(n.domain()).range(n.range()).interpolate(n.interpolate()).clamp(n.clamp()).unknown(n.unknown())}function hr(){var n=mt,t=mt,e=xn,r,u,i,o=un,a,c,s;function f(){var l=Math.min(n.length,t.length);return o!==un&&(o=fr(n[0],n[l-1])),a=l>2?lr:sr,c=s=null,h}function h(l){return l==null||isNaN(l=+l)?i:(c||(c=a(n.map(r),t,e)))(r(o(l)))}return h.invert=function(l){return o(u((s||(s=a(t,n.map(r),Yn)))(l)))},h.domain=function(l){return arguments.length?(n=Array.from(l,cr),f()):n.slice()},h.range=function(l){return arguments.length?(t=Array.from(l),f()):t.slice()},h.rangeRound=function(l){return t=Array.from(l),e=qe,f()},h.clamp=function(l){return arguments.length?(o=l?!0:un,f()):o!==un},h.interpolate=function(l){return arguments.length?(e=l,f()):e},h.unknown=function(l){return arguments.length?(i=l,h):i},function(l,g){return r=l,u=g,f()}}function Yt(){return hr()(un,un)}function mr(n,t,e,r){var u=Pn(n,t,e),i;switch(r=vn(r==null?",f":r),r.type){case"s":{var o=Math.max(Math.abs(n),Math.abs(t));return r.precision==null&&!isNaN(i=ur(u,o))&&(r.precision=i),bt(r,o)}case"":case"e":case"g":case"p":case"r":{r.precision==null&&!isNaN(i=or(u,Math.max(Math.abs(n),Math.abs(t))))&&(r.precision=i-(r.type==="e"));break}case"f":case"%":{r.precision==null&&!isNaN(i=ir(u))&&(r.precision=i-(r.type==="%")*2);break}}return $n(r)}function gr(n){var t=n.domain;return n.ticks=function(e){var r=t();return Ne(r[0],r[r.length-1],e==null?10:e)},n.tickFormat=function(e,r){var u=t();return mr(u[0],u[u.length-1],e==null?10:e,r)},n.nice=function(e){e==null&&(e=10);var r=t(),u=0,i=r.length-1,o=r[u],a=r[i],c,s,f=10;for(a<o&&(s=o,o=a,a=s,s=u,u=i,i=s);f-- >0;){if(s=St(o,a,e),s===c)return r[u]=o,r[i]=a,t(r);if(s>0)o=Math.floor(o/s)*s,a=Math.ceil(a/s)*s;else if(s<0)o=Math.ceil(o*s)/s,a=Math.floor(a*s)/s;else break;c=s}return n},n}function Ht(){var n=Yt();return n.copy=function(){return Nt(n,Ht())},At.apply(n,arguments),gr(n)}function dr(n,t){n=n.slice();var e=0,r=n.length-1,u=n[e],i=n[r],o;return i<u&&(o=e,e=r,r=o,o=u,u=i,i=o),n[e]=t.floor(u),n[r]=t.ceil(i),n}var Dn=new Date,Fn=new Date;function H(n,t,e,r){function u(i){return n(i=arguments.length===0?new Date:new Date(+i)),i}return u.floor=function(i){return n(i=new Date(+i)),i},u.ceil=function(i){return n(i=new Date(i-1)),t(i,1),n(i),i},u.round=function(i){var o=u(i),a=u.ceil(i);return i-o<a-i?o:a},u.offset=function(i,o){return t(i=new Date(+i),o==null?1:Math.floor(o)),i},u.range=function(i,o,a){var c=[],s;if(i=u.ceil(i),a=a==null?1:Math.floor(a),!(i<o)||!(a>0))return c;do c.push(s=new Date(+i)),t(i,a),n(i);while(s<i&&i<o);return c},u.filter=function(i){return H(function(o){if(o>=o)for(;n(o),!i(o);)o.setTime(o-1)},function(o,a){if(o>=o)if(a<0)for(;++a<=0;)for(;t(o,-1),!i(o););else for(;--a>=0;)for(;t(o,1),!i(o););})},e&&(u.count=function(i,o){return Dn.setTime(+i),Fn.setTime(+o),n(Dn),n(Fn),Math.floor(e(Dn,Fn))},u.every=function(i){return i=Math.floor(i),!isFinite(i)||!(i>0)?null:i>1?u.filter(r?function(o){return r(o)%i===0}:function(o){return u.count(0,o)%i===0}):u}),u}var Tn=H(function(){},function(n,t){n.setTime(+n+t)},function(n,t){return t-n});Tn.every=function(n){return n=Math.floor(n),!isFinite(n)||!(n>0)?null:n>1?H(function(t){t.setTime(Math.floor(t/n)*n)},function(t,e){t.setTime(+t+e*n)},function(t,e){return(e-t)/n}):Tn};var yr=Tn;Tn.range;const Z=1e3,O=Z*60,V=O*60,Q=V*24,qn=Q*7,gt=Q*30,bn=Q*365;var Lt=H(function(n){n.setTime(n-n.getMilliseconds())},function(n,t){n.setTime(+n+t*Z)},function(n,t){return(t-n)/Z},function(n){return n.getUTCSeconds()}),gn=Lt;Lt.range;var Wt=H(function(n){n.setTime(n-n.getMilliseconds()-n.getSeconds()*Z)},function(n,t){n.setTime(+n+t*O)},function(n,t){return(t-n)/O},function(n){return n.getMinutes()}),Pt=Wt;Wt.range;var zt=H(function(n){n.setTime(n-n.getMilliseconds()-n.getSeconds()*Z-n.getMinutes()*O)},function(n,t){n.setTime(+n+t*V)},function(n,t){return(t-n)/V},function(n){return n.getHours()}),Ot=zt;zt.range;var It=H(n=>n.setHours(0,0,0,0),(n,t)=>n.setDate(n.getDate()+t),(n,t)=>(t-n-(t.getTimezoneOffset()-n.getTimezoneOffset())*O)/Q,n=>n.getDate()-1),Cn=It;It.range;function J(n){return H(function(t){t.setDate(t.getDate()-(t.getDay()+7-n)%7),t.setHours(0,0,0,0)},function(t,e){t.setDate(t.getDate()+e*7)},function(t,e){return(e-t-(e.getTimezoneOffset()-t.getTimezoneOffset())*O)/qn})}var kn=J(0),_n=J(1),pr=J(2),Mr=J(3),an=J(4),vr=J(5),Tr=J(6);kn.range;_n.range;pr.range;Mr.range;an.range;vr.range;Tr.range;var Et=H(function(n){n.setDate(1),n.setHours(0,0,0,0)},function(n,t){n.setMonth(n.getMonth()+t)},function(n,t){return t.getMonth()-n.getMonth()+(t.getFullYear()-n.getFullYear())*12},function(n){return n.getMonth()}),Bt=Et;Et.range;var Xn=H(function(n){n.setMonth(0,1),n.setHours(0,0,0,0)},function(n,t){n.setFullYear(n.getFullYear()+t)},function(n,t){return t.getFullYear()-n.getFullYear()},function(n){return n.getFullYear()});Xn.every=function(n){return!isFinite(n=Math.floor(n))||!(n>0)?null:H(function(t){t.setFullYear(Math.floor(t.getFullYear()/n)*n),t.setMonth(0,1),t.setHours(0,0,0,0)},function(t,e){t.setFullYear(t.getFullYear()+e*n)})};var G=Xn;Xn.range;var Zt=H(function(n){n.setUTCSeconds(0,0)},function(n,t){n.setTime(+n+t*O)},function(n,t){return(t-n)/O},function(n){return n.getUTCMinutes()}),_r=Zt;Zt.range;var Vt=H(function(n){n.setUTCMinutes(0,0,0)},function(n,t){n.setTime(+n+t*V)},function(n,t){return(t-n)/V},function(n){return n.getUTCHours()}),wr=Vt;Vt.range;var jt=H(function(n){n.setUTCHours(0,0,0,0)},function(n,t){n.setUTCDate(n.getUTCDate()+t)},function(n,t){return(t-n)/Q},function(n){return n.getUTCDate()-1}),Qn=jt;jt.range;function K(n){return H(function(t){t.setUTCDate(t.getUTCDate()-(t.getUTCDay()+7-n)%7),t.setUTCHours(0,0,0,0)},function(t,e){t.setUTCDate(t.getUTCDate()+e*7)},function(t,e){return(e-t)/qn})}var Gn=K(0),wn=K(1),xr=K(2),Cr=K(3),cn=K(4),kr=K(5),Ur=K(6);Gn.range;wn.range;xr.range;Cr.range;cn.range;kr.range;Ur.range;var Rt=H(function(n){n.setUTCDate(1),n.setUTCHours(0,0,0,0)},function(n,t){n.setUTCMonth(n.getUTCMonth()+t)},function(n,t){return t.getUTCMonth()-n.getUTCMonth()+(t.getUTCFullYear()-n.getUTCFullYear())*12},function(n){return n.getUTCMonth()}),Sr=Rt;Rt.range;var Jn=H(function(n){n.setUTCMonth(0,1),n.setUTCHours(0,0,0,0)},function(n,t){n.setUTCFullYear(n.getUTCFullYear()+t)},function(n,t){return t.getUTCFullYear()-n.getUTCFullYear()},function(n){return n.getUTCFullYear()});Jn.every=function(n){return!isFinite(n=Math.floor(n))||!(n>0)?null:H(function(t){t.setUTCFullYear(Math.floor(t.getUTCFullYear()/n)*n),t.setUTCMonth(0,1),t.setUTCHours(0,0,0,0)},function(t,e){t.setUTCFullYear(t.getUTCFullYear()+e*n)})};var fn=Jn;Jn.range;function $t(n,t,e,r,u,i){const o=[[gn,1,Z],[gn,5,5*Z],[gn,15,15*Z],[gn,30,30*Z],[i,1,O],[i,5,5*O],[i,15,15*O],[i,30,30*O],[u,1,V],[u,3,3*V],[u,6,6*V],[u,12,12*V],[r,1,Q],[r,2,2*Q],[e,1,qn],[t,1,gt],[t,3,3*gt],[n,1,bn]];function a(s,f,h){const l=f<s;l&&([s,f]=[f,s]);const g=h&&typeof h.range=="function"?h:c(s,f,h),_=g?g.range(s,+f+1):[];return l?_.reverse():_}function c(s,f,h){const l=Math.abs(f-s)/h,g=Vn(([,,k])=>k).right(o,l);if(g===o.length)return n.every(Pn(s/bn,f/bn,h));if(g===0)return yr.every(Math.max(Pn(s,f,h),1));const[_,S]=o[l/o[g-1][2]<o[g][2]/l?g-1:g];return _.every(S)}return[a,c]}$t(fn,Sr,Gn,Qn,wr,_r);const[Dr,Fr]=$t(G,Bt,kn,Cn,Ot,Pt);function An(n){if(0<=n.y&&n.y<100){var t=new Date(-1,n.m,n.d,n.H,n.M,n.S,n.L);return t.setFullYear(n.y),t}return new Date(n.y,n.m,n.d,n.H,n.M,n.S,n.L)}function Nn(n){if(0<=n.y&&n.y<100){var t=new Date(Date.UTC(-1,n.m,n.d,n.H,n.M,n.S,n.L));return t.setUTCFullYear(n.y),t}return new Date(Date.UTC(n.y,n.m,n.d,n.H,n.M,n.S,n.L))}function sn(n,t,e){return{y:n,m:t,d:e,H:0,M:0,S:0,L:0}}function br(n){var t=n.dateTime,e=n.date,r=n.time,u=n.periods,i=n.days,o=n.shortDays,a=n.months,c=n.shortMonths,s=ln(u),f=hn(u),h=ln(i),l=hn(i),g=ln(o),_=hn(o),S=ln(a),k=hn(a),D=ln(c),b=hn(c),w={a:tn,A:en,b:E,B:oe,c:null,d:Tt,e:Tt,f:Kr,g:fi,G:li,H:Qr,I:Gr,j:Jr,L:qt,m:ni,M:ti,p:ae,q:ce,Q:xt,s:Ct,S:ei,u:ri,U:ii,V:ui,w:oi,W:ai,x:null,X:null,y:ci,Y:si,Z:hi,"%":wt},F={a:fe,A:se,b:le,B:he,c:null,d:_t,e:_t,f:yi,g:Ui,G:Di,H:mi,I:gi,j:di,L:Qt,m:pi,M:Mi,p:me,q:ge,Q:xt,s:Ct,S:vi,u:Ti,U:_i,V:wi,w:xi,W:Ci,x:null,X:null,y:ki,Y:Si,Z:Fi,"%":wt},U={a:B,A:p,b:N,B:A,c:R,d:Mt,e:Mt,f:Rr,g:pt,G:yt,H:vt,I:vt,j:Br,L:jr,m:Er,M:Zr,p:j,q:Ir,Q:qr,s:Xr,S:Vr,u:Lr,U:Wr,V:Pr,w:Hr,W:zr,x:dn,X:nn,y:pt,Y:yt,Z:Or,"%":$r};w.x=y(e,w),w.X=y(r,w),w.c=y(t,w),F.x=y(e,F),F.X=y(r,F),F.c=y(t,F);function y(d,M){return function(v){var m=[],W=-1,C=0,P=d.length,z,q,nt;for(v instanceof Date||(v=new Date(+v));++W<P;)d.charCodeAt(W)===37&&(m.push(d.slice(C,W)),(q=dt[z=d.charAt(++W)])!=null?z=d.charAt(++W):q=z==="e"?" ":"0",(nt=M[z])&&(z=nt(v,q)),m.push(z),C=W+1);return m.push(d.slice(C,W)),m.join("")}}function x(d,M){return function(v){var m=sn(1900,void 0,1),W=I(m,d,v+="",0),C,P;if(W!=v.length)return null;if("Q"in m)return new Date(m.Q);if("s"in m)return new Date(m.s*1e3+("L"in m?m.L:0));if(M&&!("Z"in m)&&(m.Z=0),"p"in m&&(m.H=m.H%12+m.p*12),m.m===void 0&&(m.m="q"in m?m.q:0),"V"in m){if(m.V<1||m.V>53)return null;"w"in m||(m.w=1),"Z"in m?(C=Nn(sn(m.y,0,1)),P=C.getUTCDay(),C=P>4||P===0?wn.ceil(C):wn(C),C=Qn.offset(C,(m.V-1)*7),m.y=C.getUTCFullYear(),m.m=C.getUTCMonth(),m.d=C.getUTCDate()+(m.w+6)%7):(C=An(sn(m.y,0,1)),P=C.getDay(),C=P>4||P===0?_n.ceil(C):_n(C),C=Cn.offset(C,(m.V-1)*7),m.y=C.getFullYear(),m.m=C.getMonth(),m.d=C.getDate()+(m.w+6)%7)}else("W"in m||"U"in m)&&("w"in m||(m.w="u"in m?m.u%7:"W"in m?1:0),P="Z"in m?Nn(sn(m.y,0,1)).getUTCDay():An(sn(m.y,0,1)).getDay(),m.m=0,m.d="W"in m?(m.w+6)%7+m.W*7-(P+5)%7:m.w+m.U*7-(P+6)%7);return"Z"in m?(m.H+=m.Z/100|0,m.M+=m.Z%100,Nn(m)):An(m)}}function I(d,M,v,m){for(var W=0,C=M.length,P=v.length,z,q;W<C;){if(m>=P)return-1;if(z=M.charCodeAt(W++),z===37){if(z=M.charAt(W++),q=U[z in dt?M.charAt(W++):z],!q||(m=q(d,v,m))<0)return-1}else if(z!=v.charCodeAt(m++))return-1}return m}function j(d,M,v){var m=s.exec(M.slice(v));return m?(d.p=f.get(m[0].toLowerCase()),v+m[0].length):-1}function B(d,M,v){var m=g.exec(M.slice(v));return m?(d.w=_.get(m[0].toLowerCase()),v+m[0].length):-1}function p(d,M,v){var m=h.exec(M.slice(v));return m?(d.w=l.get(m[0].toLowerCase()),v+m[0].length):-1}function N(d,M,v){var m=D.exec(M.slice(v));return m?(d.m=b.get(m[0].toLowerCase()),v+m[0].length):-1}function A(d,M,v){var m=S.exec(M.slice(v));return m?(d.m=k.get(m[0].toLowerCase()),v+m[0].length):-1}function R(d,M,v){return I(d,t,M,v)}function dn(d,M,v){return I(d,e,M,v)}function nn(d,M,v){return I(d,r,M,v)}function tn(d){return o[d.getDay()]}function en(d){return i[d.getDay()]}function E(d){return c[d.getMonth()]}function oe(d){return a[d.getMonth()]}function ae(d){return u[+(d.getHours()>=12)]}function ce(d){return 1+~~(d.getMonth()/3)}function fe(d){return o[d.getUTCDay()]}function se(d){return i[d.getUTCDay()]}function le(d){return c[d.getUTCMonth()]}function he(d){return a[d.getUTCMonth()]}function me(d){return u[+(d.getUTCHours()>=12)]}function ge(d){return 1+~~(d.getUTCMonth()/3)}return{format:function(d){var M=y(d+="",w);return M.toString=function(){return d},M},parse:function(d){var M=x(d+="",!1);return M.toString=function(){return d},M},utcFormat:function(d){var M=y(d+="",F);return M.toString=function(){return d},M},utcParse:function(d){var M=x(d+="",!0);return M.toString=function(){return d},M}}}var dt={"-":"",_:" ",0:"0"},L=/^\s*\d+/,Ar=/^%/,Nr=/[\\^$*+?|[\]().{}]/g;function T(n,t,e){var r=n<0?"-":"",u=(r?-n:n)+"",i=u.length;return r+(i<e?new Array(e-i+1).join(t)+u:u)}function Yr(n){return n.replace(Nr,"\\$&")}function ln(n){return new RegExp("^(?:"+n.map(Yr).join("|")+")","i")}function hn(n){return new Map(n.map((t,e)=>[t.toLowerCase(),e]))}function Hr(n,t,e){var r=L.exec(t.slice(e,e+1));return r?(n.w=+r[0],e+r[0].length):-1}function Lr(n,t,e){var r=L.exec(t.slice(e,e+1));return r?(n.u=+r[0],e+r[0].length):-1}function Wr(n,t,e){var r=L.exec(t.slice(e,e+2));return r?(n.U=+r[0],e+r[0].length):-1}function Pr(n,t,e){var r=L.exec(t.slice(e,e+2));return r?(n.V=+r[0],e+r[0].length):-1}function zr(n,t,e){var r=L.exec(t.slice(e,e+2));return r?(n.W=+r[0],e+r[0].length):-1}function yt(n,t,e){var r=L.exec(t.slice(e,e+4));return r?(n.y=+r[0],e+r[0].length):-1}function pt(n,t,e){var r=L.exec(t.slice(e,e+2));return r?(n.y=+r[0]+(+r[0]>68?1900:2e3),e+r[0].length):-1}function Or(n,t,e){var r=/^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(t.slice(e,e+6));return r?(n.Z=r[1]?0:-(r[2]+(r[3]||"00")),e+r[0].length):-1}function Ir(n,t,e){var r=L.exec(t.slice(e,e+1));return r?(n.q=r[0]*3-3,e+r[0].length):-1}function Er(n,t,e){var r=L.exec(t.slice(e,e+2));return r?(n.m=r[0]-1,e+r[0].length):-1}function Mt(n,t,e){var r=L.exec(t.slice(e,e+2));return r?(n.d=+r[0],e+r[0].length):-1}function Br(n,t,e){var r=L.exec(t.slice(e,e+3));return r?(n.m=0,n.d=+r[0],e+r[0].length):-1}function vt(n,t,e){var r=L.exec(t.slice(e,e+2));return r?(n.H=+r[0],e+r[0].length):-1}function Zr(n,t,e){var r=L.exec(t.slice(e,e+2));return r?(n.M=+r[0],e+r[0].length):-1}function Vr(n,t,e){var r=L.exec(t.slice(e,e+2));return r?(n.S=+r[0],e+r[0].length):-1}function jr(n,t,e){var r=L.exec(t.slice(e,e+3));return r?(n.L=+r[0],e+r[0].length):-1}function Rr(n,t,e){var r=L.exec(t.slice(e,e+6));return r?(n.L=Math.floor(r[0]/1e3),e+r[0].length):-1}function $r(n,t,e){var r=Ar.exec(t.slice(e,e+1));return r?e+r[0].length:-1}function qr(n,t,e){var r=L.exec(t.slice(e));return r?(n.Q=+r[0],e+r[0].length):-1}function Xr(n,t,e){var r=L.exec(t.slice(e));return r?(n.s=+r[0],e+r[0].length):-1}function Tt(n,t){return T(n.getDate(),t,2)}function Qr(n,t){return T(n.getHours(),t,2)}function Gr(n,t){return T(n.getHours()%12||12,t,2)}function Jr(n,t){return T(1+Cn.count(G(n),n),t,3)}function qt(n,t){return T(n.getMilliseconds(),t,3)}function Kr(n,t){return qt(n,t)+"000"}function ni(n,t){return T(n.getMonth()+1,t,2)}function ti(n,t){return T(n.getMinutes(),t,2)}function ei(n,t){return T(n.getSeconds(),t,2)}function ri(n){var t=n.getDay();return t===0?7:t}function ii(n,t){return T(kn.count(G(n)-1,n),t,2)}function Xt(n){var t=n.getDay();return t>=4||t===0?an(n):an.ceil(n)}function ui(n,t){return n=Xt(n),T(an.count(G(n),n)+(G(n).getDay()===4),t,2)}function oi(n){return n.getDay()}function ai(n,t){return T(_n.count(G(n)-1,n),t,2)}function ci(n,t){return T(n.getFullYear()%100,t,2)}function fi(n,t){return n=Xt(n),T(n.getFullYear()%100,t,2)}function si(n,t){return T(n.getFullYear()%1e4,t,4)}function li(n,t){var e=n.getDay();return n=e>=4||e===0?an(n):an.ceil(n),T(n.getFullYear()%1e4,t,4)}function hi(n){var t=n.getTimezoneOffset();return(t>0?"-":(t*=-1,"+"))+T(t/60|0,"0",2)+T(t%60,"0",2)}function _t(n,t){return T(n.getUTCDate(),t,2)}function mi(n,t){return T(n.getUTCHours(),t,2)}function gi(n,t){return T(n.getUTCHours()%12||12,t,2)}function di(n,t){return T(1+Qn.count(fn(n),n),t,3)}function Qt(n,t){return T(n.getUTCMilliseconds(),t,3)}function yi(n,t){return Qt(n,t)+"000"}function pi(n,t){return T(n.getUTCMonth()+1,t,2)}function Mi(n,t){return T(n.getUTCMinutes(),t,2)}function vi(n,t){return T(n.getUTCSeconds(),t,2)}function Ti(n){var t=n.getUTCDay();return t===0?7:t}function _i(n,t){return T(Gn.count(fn(n)-1,n),t,2)}function Gt(n){var t=n.getUTCDay();return t>=4||t===0?cn(n):cn.ceil(n)}function wi(n,t){return n=Gt(n),T(cn.count(fn(n),n)+(fn(n).getUTCDay()===4),t,2)}function xi(n){return n.getUTCDay()}function Ci(n,t){return T(wn.count(fn(n)-1,n),t,2)}function ki(n,t){return T(n.getUTCFullYear()%100,t,2)}function Ui(n,t){return n=Gt(n),T(n.getUTCFullYear()%100,t,2)}function Si(n,t){return T(n.getUTCFullYear()%1e4,t,4)}function Di(n,t){var e=n.getUTCDay();return n=e>=4||e===0?cn(n):cn.ceil(n),T(n.getUTCFullYear()%1e4,t,4)}function Fi(){return"+0000"}function wt(){return"%"}function xt(n){return+n}function Ct(n){return Math.floor(+n/1e3)}var rn,Kn,Zn;bi({dateTime:"%x, %X",date:"%-m/%-d/%Y",time:"%-I:%M:%S %p",periods:["AM","PM"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]});function bi(n){return rn=br(n),Kn=rn.format,Zn=rn.parse,rn.utcFormat,rn.utcParse,rn}function Ai(n){return new Date(n)}function Ni(n){return n instanceof Date?+n:+new Date(+n)}function Jt(n,t,e,r,u,i,o,a,c,s){var f=Yt(),h=f.invert,l=f.domain,g=s(".%L"),_=s(":%S"),S=s("%I:%M"),k=s("%I %p"),D=s("%a %d"),b=s("%b %d"),w=s("%B"),F=s("%Y");function U(y){return(c(y)<y?g:a(y)<y?_:o(y)<y?S:i(y)<y?k:r(y)<y?u(y)<y?D:b:e(y)<y?w:F)(y)}return f.invert=function(y){return new Date(h(y))},f.domain=function(y){return arguments.length?l(Array.from(y,Ni)):l().map(Ai)},f.ticks=function(y){var x=l();return n(x[0],x[x.length-1],y==null?10:y)},f.tickFormat=function(y,x){return x==null?U:s(x)},f.nice=function(y){var x=l();return(!y||typeof y.range!="function")&&(y=t(x[0],x[x.length-1],y==null?10:y)),y?l(dr(x,y)):f},f.copy=function(){return Nt(f,Jt(n,t,e,r,u,i,o,a,c,s))},f}function Yi(){return At.apply(Jt(Dr,Fr,G,Bt,kn,Cn,Ot,Pt,gn,Kn).domain([new Date(2e3,0,1),new Date(2e3,0,2)]),arguments)}function Y(n){return function(){return n}}function Kt(n){return typeof n=="object"&&"length"in n?n:Array.from(n)}function ne(n){this._context=n}ne.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){(this._line||this._line!==0&&this._point===1)&&this._context.closePath(),this._line=1-this._line},point:function(n,t){switch(n=+n,t=+t,this._point){case 0:this._point=1,this._line?this._context.lineTo(n,t):this._context.moveTo(n,t);break;case 1:this._point=2;default:this._context.lineTo(n,t);break}}};function te(n){return new ne(n)}function ee(n){return n[0]}function re(n){return n[1]}function ie(n,t){var e=Y(!0),r=null,u=te,i=null;n=typeof n=="function"?n:n===void 0?ee:Y(n),t=typeof t=="function"?t:t===void 0?re:Y(t);function o(a){var c,s=(a=Kt(a)).length,f,h=!1,l;for(r==null&&(i=u(l=jn())),c=0;c<=s;++c)!(c<s&&e(f=a[c],c,a))===h&&((h=!h)?i.lineStart():i.lineEnd()),h&&i.point(+n(f,c,a),+t(f,c,a));if(l)return i=null,l+""||null}return o.x=function(a){return arguments.length?(n=typeof a=="function"?a:Y(+a),o):n},o.y=function(a){return arguments.length?(t=typeof a=="function"?a:Y(+a),o):t},o.defined=function(a){return arguments.length?(e=typeof a=="function"?a:Y(!!a),o):e},o.curve=function(a){return arguments.length?(u=a,r!=null&&(i=u(r)),o):u},o.context=function(a){return arguments.length?(a==null?r=i=null:i=u(r=a),o):r},o}function Hi(n,t,e){var r=null,u=Y(!0),i=null,o=te,a=null;n=typeof n=="function"?n:n===void 0?ee:Y(+n),t=typeof t=="function"?t:Y(t===void 0?0:+t),e=typeof e=="function"?e:e===void 0?re:Y(+e);function c(f){var h,l,g,_=(f=Kt(f)).length,S,k=!1,D,b=new Array(_),w=new Array(_);for(i==null&&(a=o(D=jn())),h=0;h<=_;++h){if(!(h<_&&u(S=f[h],h,f))===k)if(k=!k)l=h,a.areaStart(),a.lineStart();else{for(a.lineEnd(),a.lineStart(),g=h-1;g>=l;--g)a.point(b[g],w[g]);a.lineEnd(),a.areaEnd()}k&&(b[h]=+n(S,h,f),w[h]=+t(S,h,f),a.point(r?+r(S,h,f):b[h],e?+e(S,h,f):w[h]))}if(D)return a=null,D+""||null}function s(){return ie().defined(u).curve(o).context(i)}return c.x=function(f){return arguments.length?(n=typeof f=="function"?f:Y(+f),r=null,c):n},c.x0=function(f){return arguments.length?(n=typeof f=="function"?f:Y(+f),c):n},c.x1=function(f){return arguments.length?(r=f==null?null:typeof f=="function"?f:Y(+f),c):r},c.y=function(f){return arguments.length?(t=typeof f=="function"?f:Y(+f),e=null,c):t},c.y0=function(f){return arguments.length?(t=typeof f=="function"?f:Y(+f),c):t},c.y1=function(f){return arguments.length?(e=f==null?null:typeof f=="function"?f:Y(+f),c):e},c.lineX0=c.lineY0=function(){return s().x(n).y(t)},c.lineY1=function(){return s().x(n).y(e)},c.lineX1=function(){return s().x(r).y(t)},c.defined=function(f){return arguments.length?(u=typeof f=="function"?f:Y(!!f),c):u},c.curve=function(f){return arguments.length?(o=f,i!=null&&(a=o(i)),c):o},c.context=function(f){return arguments.length?(f==null?i=a=null:a=o(i=f),c):i},c}function kt(n,t,e){n._context.bezierCurveTo(n._x1+n._k*(n._x2-n._x0),n._y1+n._k*(n._y2-n._y0),n._x2+n._k*(n._x1-t),n._y2+n._k*(n._y1-e),n._x2,n._y2)}function ue(n,t){this._context=n,this._k=(1-t)/6}ue.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x2,this._y2);break;case 3:kt(this,this._x1,this._y1);break}(this._line||this._line!==0&&this._point===1)&&this._context.closePath(),this._line=1-this._line},point:function(n,t){switch(n=+n,t=+t,this._point){case 0:this._point=1,this._line?this._context.lineTo(n,t):this._context.moveTo(n,t);break;case 1:this._point=2,this._x1=n,this._y1=t;break;case 2:this._point=3;default:kt(this,n,t);break}this._x0=this._x1,this._x1=this._x2,this._x2=n,this._y0=this._y1,this._y1=this._y2,this._y2=t}};var Ut=function n(t){function e(r){return new ue(r,t)}return e.tension=function(r){return n(+r)},e}(0);const $={left:32,right:16,top:12,bottom:28};class Li{constructor(t){this.width=t.clientWidth-$.left-$.right,this.canvas=Be(t).append("svg").attr("viewBox",`0 0 ${this.width+$.left+$.right} ${this.width/3.5+$.top+$.bottom}`).attr("width","100%").append("g").attr("transform","translate("+$.left+","+$.top+")"),this.render()}render(){const{canvas:t,width:e}=this;t.append("defs").append("linearGradient").attr("id","gradient").attr("x1",e).attr("y1",0).attr("x2",e).attr("y2",e/3.5).attr("gradientUnits","userSpaceOnUse").selectAll("stop").data([{offset:"0%",color:"#87BBFF88"},{offset:"100%",color:"#87BBFF00"}]).enter().append("stop").attr("offset",r=>r.offset).attr("stop-color",r=>r.color)}update(t){const{canvas:e,width:r}=this,u=Yi().domain(Ae(t,l=>+l.xpoint)).range([0,r]),i=Ht().domain([0,Ye(t,l=>+l.ypoint)]).range([r/3.5,0]).nice();e.append("g").attr("class","xAxis chart-legend").call(Ee(i).tickFormat($n("~s")).tickSize(-r*1.3).ticks(5)).select(".domain").remove(),e.append("g").attr("class","yAxis chart-legend").attr("transform","translate(0,"+r/3.5+")").call(Ie(u).tickFormat(Kn("%d.%m")).tickSize(-r/3.5*1.3).ticks(7)).select(".domain").remove(),e.selectAll(".xAxis line").attr("x2",r),e.selectAll(".tick line").attr("stroke","#cccccc88"),e.selectAll(".xAxis .tick text").attr("x",-5),e.selectAll(".yAxis .tick text").attr("y",12);const o=e.selectAll(".area").data([t],l=>l.xpoint),a=Hi().x(l=>u(l.xpoint)).y0(i(0)).y1(l=>i(l.ypoint)).curve(Ut),c=xn(t.map(l=>({...l,ypoint:0})),t);o.enter().append("path").attr("class","area").merge(o).attr("stroke-width",1.5).attr("fill","url(#gradient)").attr("d",a).transition().duration(3e3).attrTween("d",()=>l=>a(c(l)));const s=e.selectAll(".line").data([t],l=>l.xpoint),f=ie().x(l=>u(l.xpoint)).y(l=>i(l.ypoint)).curve(Ut);s.enter().append("path").attr("class","line").merge(s).attr("stroke","#87BBFF").attr("stroke-width",1.5).attr("fill","none").attr("d",f).transition().duration(3e3).attrTween("d",()=>l=>f(c(l)));const h=e.selectAll(".circle").data(t);h.enter().append("circle").merge(h).attr("class","circle").attr("fill","#87BBFF").attr("cx",l=>u(l.xpoint)).attr("cy",l=>i(l.ypoint)).attr("r",6).transition().duration(3e3).attrTween("cy",(l,g)=>_=>i(c(_)[g].ypoint))}}const Wi=ve({__name:"Chart",props:{chartData:null,loading:{type:Boolean}},setup(n,{expose:t}){t();const{chartData:e,loading:r}=n,u=it(e),i=it(null),o=Te({chart:null});_e(()=>{var c;if(o.chart=new Li(i.value),(c=u.value)!=null&&c.length){const s=e.map(f=>({xpoint:Zn("%Y-%m-%dT%H:%M:%S.000Z")(f.time),ypoint:f.transactionCount}));o.chart.update(s.splice(-7))}}),we(u,c=>{if(c!=null&&c.length){const s=e.map(f=>({xpoint:Zn("%Y-%m-%dT%H:%M:%S.000Z")(f.time),ypoint:f.transactionCount}));o.chart.update(s.splice(-7))}});const a={data:u,chartNode:i,state:o};return Object.defineProperty(a,"__isScriptSetup",{enumerable:!1,value:!0}),a}}),Pi={ref:"chartNode"},zi={key:0};function Oi(n,t,e,r,u,i){return ut(),ot("div",null,[xe("div",Pi,null,512),e.loading?(ut(),ot("div",zi,"\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430")):Ce("",!0)])}var Ei=Me(Wi,[["render",Oi]]);export{Ei as default};
