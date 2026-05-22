import { DAVAO_HOSPITALS, Hospital } from "./hospitals";

const DISTRICT_PROXIMITY: Record<string, string[]> = {
  Poblacion: ["Poblacion", "Agdao", "Talomo", "Buhangin", "Tugbok", "Calinan", "Toril", "Bunawan", "Baguio", "Marilog", "Paquibato"],
  Agdao: ["Agdao", "Poblacion", "Buhangin", "Bunawan", "Talomo", "Tugbok", "Calinan", "Toril", "Baguio", "Marilog", "Paquibato"],
  Buhangin: ["Buhangin", "Agdao", "Poblacion", "Bunawan", "Talomo", "Tugbok", "Paquibato", "Calinan", "Toril", "Baguio", "Marilog"],
  Talomo: ["Talomo", "Poblacion", "Tugbok", "Buhangin", "Toril", "Agdao", "Calinan", "Baguio", "Marilog", "Bunawan", "Paquibato"],
  Tugbok: ["Tugbok", "Talomo", "Calinan", "Baguio", "Poblacion", "Buhangin", "Toril", "Marilog", "Agdao", "Bunawan", "Paquibato"],
  Calinan: ["Calinan", "Tugbok", "Baguio", "Marilog", "Talomo", "Poblacion", "Buhangin", "Toril", "Agdao", "Bunawan", "Paquibato"],
  Baguio: ["Baguio", "Calinan", "Tugbok", "Marilog", "Talomo", "Poblacion", "Buhangin", "Toril", "Agdao", "Bunawan", "Paquibato"],
  Marilog: ["Marilog", "Calinan", "Baguio", "Tugbok", "Talomo", "Poblacion", "Buhangin", "Toril", "Agdao", "Bunawan", "Paquibato"],
  Toril: ["Toril", "Talomo", "Tugbok", "Poblacion", "Buhangin", "Calinan", "Baguio", "Marilog", "Agdao", "Bunawan", "Paquibato"],
  Bunawan: ["Bunawan", "Buhangin", "Agdao", "Panacan", "Paquibato", "Poblacion", "Talomo", "Tugbok", "Calinan", "Toril", "Baguio", "Marilog"],
  Paquibato: ["Paquibato", "Bunawan", "Buhangin", "Agdao", "Poblacion", "Talomo", "Tugbok", "Calinan", "Toril", "Baguio", "Marilog"]
};

function normalizeDistrict(district: string): string {
  const d = district.trim().toLowerCase();
  if (d === "panacan") return "Bunawan";
  if (d === "lanang") return "Buhangin";
  return district.charAt(0).toUpperCase() + district.slice(1);
}

function getDistrictForBarangay(barangay: string): string {
  const b = barangay.trim().toLowerCase();
  
  if (b.startsWith("barangay ") && (b.endsWith("-a") || b.endsWith("-b") || b.endsWith("-c") || b.endsWith("-d"))) {
    return "Poblacion";
  }
  
  const talomo = [
    "bago aplaya", "bago gallera", "baliok", "bucana", "catalunan grande", 
    "catalunan pequeño", "dumoy", "langub", "ma-a", "magtuod", 
    "matina aplaya", "matina crossing", "matina pangi", "talomo", "talomo proper"
  ];
  if (talomo.includes(b)) return "Talomo";

  const agdao = [
    "agdao", "centro", "gov. paciano bangoy", "gov. vicente duterte", 
    "kap. tomas monteverde, sr.", "lapu-lapu", "leon garcia, sr.", 
    "rafael castillo", "san antonio", "ubalde", "wilfredo aquino"
  ];
  if (agdao.includes(b)) return "Agdao";

  const buhangin = [
    "acacia", "alfonso angliongto sr.", "buhangin", "cabantian", 
    "callawa", "communal", "indangan", "mandug", "pampanga", 
    "sasa", "tigatto", "vicente hizon sr.", "waan"
  ];
  if (buhangin.includes(b)) return "Buhangin";

  const bunawan = [
    "alejandra navarro", "bunawan", "gatungan", "ilang", 
    "mahayag", "mudiang", "panacan", "san isidro", "tibungco"
  ];
  if (bunawan.includes(b)) return "Bunawan";

  const paquibato = [
    "colosas", "fatima", "lumiad", "mabuhay", "malabog", 
    "mapula", "panalum", "pandaitan", "paquibato", "paradise embak", 
    "salapawan", "sumimao", "tapak"
  ];
  if (paquibato.includes(b)) return "Paquibato";

  const baguio = [
    "baguio", "cadalian", "carmen", "gumalang", "malagos", 
    "tambobong", "tawan-tawan", "wines"
  ];
  if (baguio.includes(b)) return "Baguio";

  const calinan = [
    "biao joaquin", "calinan", "cawayan", "dacudao", "dalagdag", 
    "dominga", "inayangan", "lacson", "lamanan", "lampianao", 
    "megkawayan", "pangyan", "riverside", "saloy", "sirib", 
    "subasta", "talomo river", "tamayong", "wangan", "mintal"
  ];
  if (calinan.includes(b)) return "Calinan";

  const marilog = [
    "baganihan", "bantol", "buda", "dalag", "datu salumay", 
    "gumitan", "magsaysay", "malamba", "marilog", "salaysay", 
    "suawan", "tamugan"
  ];
  if (marilog.includes(b)) return "Marilog";

  const toril = [
    "alambre", "bangkas heights", "baracatan", "bato", "binugao", 
    "camansi", "catigan", "daliao", "daliaon plantation", "eden", 
    "garsika", "hilong-hilong", "lubogan", "lizada", "mulig", 
    "napula", "sirawan", "tagluno", "tagurano", "tibuloy", 
    "toril", "tungkalan", "atan-awe", "bayabas", "crossing bayabas", 
    "kilate", "marapangi", "sibulan"
  ];
  if (toril.includes(b)) return "Toril";
  
  const tugbok = [
    "tugbok", "mintal", "tacunan", "bago oshiro", "ula", "angalan",
    "biao escuela", "biao guianga", "los amigos", "manambulan",
    "new carmen", "new valencia", "santo niño", "talandang",
    "balengaeng", "tagakpan", "matina biao"
  ];
  if (tugbok.includes(b)) return "Tugbok";

  return "Poblacion";
}

export function findNearestHospitals(barangay: string, limit = 3): Hospital[] {
  if (!barangay) return DAVAO_HOSPITALS.slice(0, limit);

  const cleanBarangay = barangay.trim().toLowerCase();
  const residentDistrict = getDistrictForBarangay(cleanBarangay);
  const proximityOrder = DISTRICT_PROXIMITY[residentDistrict] || DISTRICT_PROXIMITY["Poblacion"];

  const scored = DAVAO_HOSPITALS.map((h) => {
    const isDirectMatch = h.nearestBarangays.some(
      (b) => b.trim().toLowerCase() === cleanBarangay
    );

    const normHospDistrict = normalizeDistrict(h.district);
    const proximityIndex = proximityOrder.indexOf(normHospDistrict);

    let score = 1000;
    if (isDirectMatch) {
      score -= 500; // direct match receives highest priority
    }
    if (proximityIndex !== -1) {
      score += proximityIndex * 10;
    } else {
      score += 200;
    }

    // Sub-sort to favor higher level hospitals when distances are similar
    if (h.category === "Level 3") {
      score -= 2;
    } else if (h.category === "Level 2") {
      score -= 1;
    }

    return { hospital: h, score };
  });

  const sorted = scored.sort((a, b) => a.score - b.score).map((s) => s.hospital);
  return sorted.slice(0, limit);
}

export type { Hospital };
