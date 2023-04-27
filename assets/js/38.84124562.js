(window.webpackJsonp=window.webpackJsonp||[]).push([[38],{403:function(e,s,t){"use strict";t.r(s);var a=t(24),n=Object(a.a)({},(function(){var e=this,s=e.$createElement,t=e._self._c||s;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("h1",{attrs:{id:"namespace-contract"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#namespace-contract"}},[e._v("#")]),e._v(" Namespace Contract")]),e._v(" "),t("p",[e._v("Concurrent Process contract instances may not be chained together and this could cause "),t("code",[e._v("processId")]),e._v(" duplication issues if the same entity created processes among them. This is why Process contracts are assigned a unique namespace Id when they are created.")]),e._v(" "),t("p",[e._v("Same as the Genesis Contract, the Namespaces also acts as a central registry where Process instances register for a unique Id. This Id also allows to filter processes when querying the Vochain or a Gateway.")]),e._v(" "),t("p",[e._v("The instance of the Namespaces contract is resolved from "),t("code",[e._v("namespaces.vocdoni.eth")]),e._v(" on the ENS registry.")]),e._v(" "),t("h2",{attrs:{id:"contract"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#contract"}},[e._v("#")]),e._v(" Contract")]),e._v(" "),t("p",[e._v("The struct defining a namespace is so simple:")]),e._v(" "),t("div",{staticClass:"language-solidity extra-class"},[t("pre",{pre:!0,attrs:{class:"language-solidity"}},[t("code",[t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("mapping")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),t("span",{pre:!0,attrs:{class:"token builtin"}},[e._v("uint32")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=>")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token builtin"}},[e._v("address")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("public")]),e._v(" namespaces"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token builtin"}},[e._v("uint32")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("public")]),e._v(" namespaceCount"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n")])])]),t("h2",{attrs:{id:"methods"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#methods"}},[e._v("#")]),e._v(" Methods")]),e._v(" "),t("ul",[t("li",[t("code",[e._v("register()")]),e._v(" is called by process contracts upon deployment. They receive a unique "),t("code",[e._v("namespaceId")]),e._v(" and are registered as the contract assigned to this index.")])])])}),[],!1,null,null,null);s.default=n.exports}}]);