const gravatarDefaults = [
    {
        "value": "404",
        "label": "404",
        "description": "do not load any image if none is associated with the email hash, instead return an HTTP 404 (File Not Found) response"
    },
    {
        "value": "mp",
        "label": "Mystery Person",
        "description": "(mystery-person) a simple, cartoon-style silhouetted outline of a person (does not vary by email hash)e"
    },
    // {
    //     "value": "mm",
    //     "label": "Mystery Man",
    //     "description": "simple, cartoon-style silhouetted outline"
    // },
    {
        "value": "identicon",
        "label": "Identicon",
        "description": "a geometric pattern based on an email hash"
    },
    {
        "value": "monsterid",
        "label": "MonsterID",
        "description": "generated \"monster\" with different colors, faces, etc"
    },
    {
        "value": "wavatar",
        "label": "Wavatar",
        "description": "generated faces with differing features and backgrounds"
    },
    {
        "value": "retro",
        "label": "Retro",
        "description": "8-bit arcade-style pixelated faces"
    },
    {
        "value": "robohash",
        "label": "Robohash",
        "description": "a generated robot with different colors, faces, etcs"
    }
];

export default gravatarDefaults