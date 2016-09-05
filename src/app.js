import maquette from "maquette";

var h = maquette.h;

var insulations = [
    { name: "Keine", price: null, m2: null },
    { name: "XPS", price: 1.69, m2: 5.59 },
    { name: "Schaum 2mm", price: 4.49, m2: 8 },
    { name: "Schaum 3mm", price: 6.49, m2: 5.5 }
];

var loc = (p) => p.toFixed(2).replace(".", ",");

class PakKalk {
    constructor() {
        this.projector = maquette.createProjector();
        this.reset();
    }

    reset() {
        this.needed = null;
        this.perpack = null;
        this.pricem2 = null;
        this.packs = 0;
        this.minPacks = 0;
        this.insulation = 0;
    }

    calcMinPacks() {
        if (!this.needed || !this.perpack) this.minPacks = 0;
        else this.minPacks = Math.ceil(parseFloat(this.needed) / parseFloat(this.perpack));
        this.packs = this.minPacks;
    }

    chNeeded(evt) { this.needed = evt.target.value; this.calcMinPacks(); }
    chPerpack(evt) { this.perpack = evt.target.value; this.calcMinPacks(); }
    chPricem2(evt) { this.pricem2 = evt.target.value; }

    addPack() {
        if (!this.needed || !this.perpack) return;
        this.packs += 1;
    }
    removePack() {
        if (!this.needed || !this.perpack) return;
        if (this.packs > this.minPacks) this.packs -= 1;
    }

    vzugabe() {
        if (!this.needed || !this.perpack || !this.packs) return null;
        let needed = parseFloat(this.needed);
        let perpack = parseFloat(this.perpack);
        let packs = parseFloat(this.packs);
        let vz = perpack * packs - needed; 
        return { m2: vz, pct: Math.round(vz / needed * 100) };
    }

    preis() {
        if (!this.perpack || !this.packs || !this.pricem2 ) return null;
        let perpack = parseFloat(this.perpack);
        let packs = parseFloat(this.packs);
        let pricem2 = parseFloat(this.pricem2);

        let price = perpack * packs * pricem2;
        if (this.insulation > 0) {
            let ins = insulations[this.insulation];
            price = price + Math.ceil((packs * perpack) / ins.m2) * ins.price;
        }
        return price.toFixed(2).replace(".", ",");
    }

    leisten() {
        if (!this.needed || !this.packs) return null;
        return Math.round((parseFloat(this.needed) * 0.8) / 2.4);
    }

    selectInsulation(evt) {
        this.insulation = evt.currentTarget["insulation"];
    }

    render() {
        let vz = this.vzugabe();
        let actm2 = this.packs ? parseFloat(this.packs) * parseFloat(this.perpack) : null;
        let actprice = actm2 ? actm2 * parseFloat(this.pricem2) : null;

        return h("div.app", [
            h("div.topbar", [
                h("h1", "Paketkalkulator")
            ]),
            h("div.spacer"),
            h("div.card", [
                h("div.input", [
                    h("label", "Bedarf"),
                    h("input", { type: "number", value: this.needed, oninput: this.chNeeded, bind: this }),
                    h("label.inset", "qm")
                ]),
                h("div.input", [
                    h("label", "qm/Paket"),
                    h("input", { type: "number", value: this.perpack, oninput: this.chPerpack, bind: this }),
                    h("label.inset", "qm")
                ]),
                h("div.input", [
                    h("label", "Preis/qm"),
                    h("input", { type: "number", value: this.pricem2, oninput: this.chPricem2, bind: this }),
                    h("label.inset", "€")
                ])
            ]),
            h("div.card", [
                h("div.tapper", [
                    h("div", h("button.chpack", {
                        classes: { disabled: this.packs <= this.minPacks || this.packs == 0 },
                        onclick: this.removePack, bind: this
                    }, "–")),
                    h("div", [
                        h("div.packs", this.packs),
                        h("label", "Pakete"),
                    ]),
                    h("div", h("button.chpack", {
                        classes: { disabled: !this.needed || !this.perpack },
                        onclick: this.addPack, bind: this
                    }, "+"))
                ]),
                h("div.stats", [
                    h("div.qm", actm2 ? loc(actm2) + "qm" : "qm total"),
                    h("div.preis", actprice ? loc(actprice) + "€" : "Preis"),
                    h("div.vzugabe", h("div.cbox", { classes: {
                        green: vz && vz.pct > 5,
                        yellow: vz && vz.pct > 3 && vz.pct <= 5,
                        red: vz && vz.pct <= 3
                    } }, (vz ? vz.m2.toFixed(2).replace(".", ",") + " (" + vz.pct + "%)" : "V-Zugabe")))
                ])
            ]),
            h("div.card", h("table", [
                h("thead", h("tr", [
                    h("th", "Dämmung"),
                    h("th", "Rolle"),
                    h("th", "Anz."),
                    h("th.right", "Preis")
                ])),
                h("tbody", insulations.map((ins, k) => {
                    let rolls = (actm2 && ins.price ? Math.ceil(actm2 / ins.m2) : null);
                    return h("tr", { insulation: k, key: ins, onclick: this.selectInsulation, bind: this,
                        classes: { selected: this.insulation == k } }, [
                        h("th", ins.name),
                        h("td", (ins.price ? [ loc(ins.m2), h("span.qm", "qm"), h("br"), loc(ins.price), h("span.eur", "€") ] : [h("br"), h("br")])),
                        h("td", (rolls ? [ rolls, h("span.rolls", " Rollen"), h("br"), loc(rolls * ins.m2), h("span.qm", "qm") ] : "")),
                        h("td.right", (rolls ? (rolls * ins.m2 * ins.price).toFixed(2).replace(".", ",") : ""))
                    ])
                }))
            ])),
            h("div.spacer"),
            h("div.results", [
                h("div.preis", [
                    h("div.result", this.preis() || "..."),
                    h("label", "Total (€)")
                ]),
                h("div.leisten", [
                    h("div.result", this.leisten() || "..."),
                    h("label", "Leisten")
                ]),
                h("div.reset", h("button.reset", { onclick: this.reset, bind: this }, "C"))
            ])
        ]);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    let pk = new PakKalk();
    pk.projector.append(document.body, pk.render.bind(pk));
});
