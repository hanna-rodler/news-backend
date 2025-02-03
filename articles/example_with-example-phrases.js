[
  [
    { original: "Terroranschlag", neutral: ["Vorfall", "Ereignis"] },
    {
      original: "Selbstmordattentäter",
      neutral: ["Angreifer", "Person, die sich selbst in die Luft sprengte"],
    },
    {
      original: "Extremisten",
      neutral: ["Radikale Gruppen", "Menschen mit extremen Ansichten"],
    },
    {
      original: "Gewalttätige Ausschreitungen",
      neutral: ["Unruhen", "Auseinandersetzungen"],
    },
    { original: "Bombenexplosion", neutral: ["Explosion", "Sprengung"] },
    {
      original: "Menschen wurden schwer verletzt",
      neutral: ["Personen erlitten schwere Verletzungen"],
    },
    { original: "Katastrophe", neutral: ["Unglück", "schwerer Zwischenfall"] },
    {
      original: "Flüchtlingskrise",
      neutral: ["Flüchtlingssituation", "Herausforderung mit Flüchtlingen"],
    },
    {
      original: "Kriegsgebiet",
      neutral: ["Konfliktzone", "Gebiet mit bewaffneten Auseinandersetzungen"],
    },
    {
      original: "Menschenrechtsverletzungen",
      neutral: [
        "Verletzungen der Menschenrechte",
        "Missachtung der Menschenrechte",
      ],
    },
  ],
  {
    article: {
      original:
        "In einem blutigen Massaker wurden gestern Abend 20 Menschen brutal ermordet. Die Täter, eine Gruppe von Rebellen, griffen das Dorf an und hinterließen eine Spur der Verwüstung. Viele Häuser wurden zerstört und die Bewohner sind in Panik geflohen.",
      rewritten:
        "Bei einem tödlichen Vorfall gestern Abend sind 20 Menschen ums Leben gekommen. Eine Gruppe von Rebellen griff das Dorf an und verursachte große Zerstörung. Viele Häuser wurden beschädigt und die Bewohner mussten schnell fliehen.",
    },
    explanation: {
      changes_made: [
        "Ersetzt 'blutigen Massaker' mit 'tödlichen Vorfall'",
        "Ersetzt 'brutal ermordet' mit 'ums Leben gekommen'",
        "Ersetzt 'eine Spur der Verwüstung' mit 'große Zerstörung'",
        "Ersetzt 'Viele Häuser wurden zerstört' mit 'Viele Häuser wurden beschädigt'",
        "Ersetzt 'in Panik geflohen' mit 'mussten schnell fliehen'",
      ],
      reasoning:
        "Die Änderungen wurden vorgenommen, um die Gewalt und das Leid zu mildern, während die Fakten und die politische Beschreibung der Rebellen beibehalten wurden. Dies soll den Kindern ermöglichen, die Informationen zu verarbeiten, ohne übermäßige Angst oder Sorge zu verursachen.",
    },
  },
  {
    article: {
      original:
        "In einem blutigen Massaker wurden gestern Abend 20 Menschen brutal ermordet, als eine Gruppe von Terroristen ein Dorf überfiel. Viele Häuser wurden zerstört und die Bewohner sind in Panik geflohen.",
      rewritten:
        "Bei einem tödlichen Vorfall gestern Abend sind 20 Menschen ums Leben gekommen, als eine Gruppe von Terroristen ein Dorf angriff. Viele Häuser wurden beschädigt und die Bewohner mussten schnell das Dorf verlassen.",
    },
  },
];

const example2 = [{ "phrases": [ { "original": "Brutal ermordet", "neutral": ["das Leben genommen"] }, { "original": "Kaltblütig erschossen", "neutral": ["Durch Schüsse ums Leben gekommen"]}, { "original": "Gnadenlos niedergemetzelt", "neutral": ["Opfer von Gewalt geworden"] }, { "original": "Blutiges Massaker", "neutral": ["Tödlicher Vorfall", "Menschen sind ums Leben gekommen"] }, { "original": "Erschlagen und liegengelassen", "neutral": ["Umgebracht und am Tatort belassen"]}, { "original": "Grausam gefoltert", "neutral": ["Misshandelt"] }, { "original": "Reihenweise hingerichtet", "neutral": ["Exekutiert", "Durch Hinrichtung getötet"] }, { "original": "In Stücke gerissen", "neutral": ["Tödlich verletzt", "Opfer von schwerer Gewalt"] }, { "original": "Erstickt und zurückgelassen", "neutral": ["Erstickt"] }, {"original": "Viele Häuser zerstört", "neutral"} ] },
  article: {
    title: 'Starkes Erdbeben in der Türkei und Syrien',
    original: 'Bei einem verheerenden Erdbeben in der Türkei und Syrien sind tausende Menschen ums Leben gekommen. Viele Häuser wurden zerstört und die Infrastruktur schwer beschädigt. Die Rettungskräfte arbeiten unter schwierigen Bedingungen, um Überlebende zu bergen.',
    neutral: 'Bei einem starken Erdbeben in der Türkei und Syrien sind tausende Menschen ums Leben gekommen. Viele Gebäude wurden beschädigt und die Infrastruktur stark beeinträchtigt. Die Rettungskräfte arbeiten hart daran, Überlebende zu finden und zu helfen.'
  }
]