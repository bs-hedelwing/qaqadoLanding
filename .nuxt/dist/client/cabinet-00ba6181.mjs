import x from"./Header-19424c82.mjs";import g from"./logo-9671fd70.mjs";import b from"./index-5255b915.mjs";import y from"./Col-2586d76a.mjs";import s from"./Chart-84160f1e.mjs";import v from"./Slider-c0f5b02e.mjs";import D from"./Button-8ed81383.mjs";import z from"./Table-3c95b8ee.mjs";import T from"./Row-9c617d09.mjs";import $ from"./Container-079e39b8.mjs";import{_ as Q,u as S,o as k,c as w,a as o,b as t,w as n,d as c}from"./entry-50e32e66.mjs";const B={async setup(){const e=S();return e.getDailyTranaactions(),{dashboardStore:e}},components:{Chart:s},data:()=>({chart:null})},N={style:{display:"flex"}},V={class:"icon-container"},C={class:"icon"},E=t("div",null,[t("h5",{style:{"font-size":"20px","margin-bottom":"1.5em"}}," Token balance "),t("p",null,"120 000 000 QQD")],-1),H=c(" 2 "),j=t("h5",{style:{"font-size":"20px","margin-bottom":"1.5em"}}," \u0413\u0440\u0430\u0444\u0438\u043A \u043E\u043D\u0447\u0435\u0439\u043D \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0435\u0432 QQD ",-1),q=t("h5",{style:{"font-size":"20px","margin-bottom":"1.5em"}}," \u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0442\u043E\u043A\u0435\u043D\u0430 ",-1),A=c("\u041A\u0443\u043F\u0438\u0442\u044C \u0442\u043E\u043A\u0435\u043D"),F=t("h5",{style:{"font-size":"20px","margin-bottom":"1.5em"}}," \u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0439 ",-1),G=t("tbody",null,[t("tr",null,[t("td",null,"\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),t("td",null,"\u0421\u0443\u043C\u043C\u0430"),t("td",null,"\u0414\u0430\u0442\u0430"),t("td",null,"\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")]),t("tr",null,[t("td",null,"\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),t("td",null,"\u0421\u0443\u043C\u043C\u0430"),t("td",null,"\u0414\u0430\u0442\u0430"),t("td",null,"\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")]),t("tr",null,[t("td",null,"\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),t("td",null,"\u0421\u0443\u043C\u043C\u0430"),t("td",null,"\u0414\u0430\u0442\u0430"),t("td",null,"\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")])],-1),I=t("h5",{style:{"font-size":"20px","margin-bottom":"1.5em"}}," \u041A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440 \u0442\u043E\u043A\u0435\u043D\u043E\u0432 ",-1);function J(e,K,L,a,M,O){const d=x,r=g,_=b,l=y,u=s,i=v,m=D,p=z,f=T,h=$;return k(),w("div",null,[o(d),t("section",null,[o(h,null,{default:n(()=>[o(f,{spacing:"md"},{default:n(()=>[o(l,{cols:12,lg:4},{default:n(()=>[o(_,null,{default:n(()=>[t("div",N,[t("div",V,[t("div",C,[o(r)])]),E])]),_:1})]),_:1}),o(l,{cols:12,lg:8},{default:n(()=>[o(_,null,{default:n(()=>[H]),_:1})]),_:1}),o(l,{cols:12,lg:8},{default:n(()=>[o(_,null,{default:n(()=>[j,o(u,{chartData:a.dashboardStore.dailyTransactions&&a.dashboardStore.dailyTransactions.data||null,loading:!1},null,8,["chartData"])]),_:1})]),_:1}),o(l,{cols:12,lg:4},{default:n(()=>[o(_,null,{default:n(()=>[q,o(i,{min:0}),o(m,null,{default:n(()=>[A]),_:1})]),_:1})]),_:1}),o(l,{cols:12,lg:8},{default:n(()=>[o(_,null,{default:n(()=>[F,o(p,{headers:["\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432","\u0421\u0443\u043C\u043C\u0430","\u0414\u0430\u0442\u0430","\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"]},{default:n(()=>[G]),_:1})]),_:1})]),_:1}),o(l,{cols:12,lg:4},{default:n(()=>[o(_,null,{default:n(()=>[I]),_:1})]),_:1})]),_:1})]),_:1})])])}var lt=Q(B,[["render",J]]);export{lt as default};