/*
 * Source data transcribed from the teaching slides:
 *   NeuroMyliNDX_2.pptx   – white matter disease pathway
 *   NeuroMylinDx-1.pptx   – MS vs NMOSD vs MOGAD comparison tables
 * Edit this file to update the medical content; the UI reads everything from here.
 */
import type {
  DemyDisease,
  DemyQuestion,
  Distribution,
  PatientBio,
  Site,
  WmAssessment,
  WmDisease,
  WmFeatures,
} from "./types";

export const EMPTY_BIO: PatientBio = {
  name: "",
  age: "",
  ageUnit: "years",
  dob: "",
  sex: "",
  patientId: "",
  phone: "",
  scanDate: "",
  referringDoctor: "",
  reportingDoctor: "",
  history: "",
};

export const EMPTY_FEATURES: WmFeatures = {
  ufibers: "",
  cavitation: false,
  enhancement: false,
  mrs: "",
  perivascular: false,
  basalGanglia: false,
  optic: false,
  perivenular: false,
  phenotype: "",
};

export const EMPTY_WM: WmAssessment = {
  t1: "",
  macro: null,
  distribution: null,
  features: EMPTY_FEATURES,
};

/* ------------------------- White matter disease ------------------------- */

/** Each disease lists its distribution(s) and discriminating features (slides 2–16). */
export const WM_DISEASES: WmDisease[] = [
  { name: "MLD", features: ["periventricular", "uf-spared", "perivenular"] },
  { name: "X-linked ALD", features: ["periventricular", "parieto-occipital", "uf-spared", "enhancement"] },
  { name: "Krabbe disease", features: ["periventricular", "parieto-occipital", "uf-spared", "enhancement", "basal-ganglia", "optic"] },
  { name: "Vanishing white matter disease", features: ["periventricular", "cavitation"] },
  { name: "Phenylketonuria", features: ["periventricular", "mrs-phenylalanine"] },
  { name: "Maple syrup urine disease", features: ["periventricular", "mrs-alpha-keto"] },
  { name: "Van der Knaap disease", features: ["subcortical", "uf-involved", "cavitation", "macrocephaly"] },
  { name: "Alexander disease", features: ["frontal", "grey-white", "uf-involved", "enhancement", "macrocephaly"] },
  { name: "CADASIL", features: ["frontal"] },
  { name: "Mucopolysaccharidoses", features: ["grey-white", "perivascular", "phenotype-mps"] },
  { name: "Canavan disease", features: ["grey-white", "uf-involved", "mrs-naa", "macrocephaly"] },
  { name: "Glutaryl aciduria", features: ["grey-white"] },
  { name: "MELAS (mitochondrial leukoencephalopathy)", features: ["grey-white", "cavitation", "mrs-lactate"] },
  { name: "4H syndrome", features: ["phenotype-four-h"] },
];

export const DISTRIBUTION_LABEL: Record<Distribution, string> = {
  periventricular: "Periventricular",
  subcortical: "Subcortical",
  frontal: "Frontal",
  "parieto-occipital": "Parieto-occipital",
  "grey-white": "Both grey and white matter",
};

export const DISTRIBUTIONS = Object.keys(DISTRIBUTION_LABEL) as Distribution[];

export const FEATURE_LABEL: Record<string, string> = {
  "uf-involved": "U-fibers involved",
  "uf-spared": "U-fibers spared",
  cavitation: "Cavitation",
  enhancement: "Contrast enhancement",
  "mrs-phenylalanine": "MRS: phenylalanine peak",
  "mrs-alpha-keto": "MRS: alpha keto amino acid peak",
  "mrs-naa": "MRS: N-acetyl aspartate peak",
  "mrs-lactate": "MRS: lactate peak",
  perivascular: "Enlarged perivascular spaces",
  "basal-ganglia": "Basal ganglia / thalami hyperdensity",
  optic: "Optic nerve enlargement / chiasma involvement",
  perivenular: "Perivenular sparing",
  "phenotype-mps": "MPS phenotypic traits",
  "phenotype-four-h": "Hypogonadotropic hypogonadism / hypodontia",
};

/* ------------------------ MS vs NMOSD vs MOGAD ------------------------ */

export const DEMY_DISEASES: DemyDisease[] = ["MS", "NMOSD", "MOGAD"];

export const DEMY_FULL_NAME: Record<DemyDisease, string> = {
  MS: "Multiple sclerosis",
  NMOSD: "Neuromyelitis optica spectrum disorder",
  MOGAD: "MOG antibody-associated disease",
};

export const SITES: Site[] = ["spinal", "optic", "brain"];

export const SITE_LABEL: Record<Site, string> = {
  spinal: "Spinal cord",
  optic: "Optic nerve",
  brain: "Brain",
};

export const SITE_SUMMARY: Record<Site, string> = {
  spinal: "Length • axial distribution • anatomical tropism • cavitation",
  optic: "Length • anatomical tropism • perineuritis • laterality",
  brain: "Lesion pattern • distribution",
};

export const DEMY_QUESTIONS: Record<Site, DemyQuestion[]> = {
  spinal: [
    {
      id: "spinal-length",
      title: "Lesion length",
      options: [
        { value: "short", label: "Short segment (<3 vertebral segments)", diseases: ["MS"] },
        { value: "long", label: "LETM (≥3 vertebral segments)", diseases: ["NMOSD", "MOGAD"] },
      ],
    },
    {
      id: "spinal-axial",
      title: "Axial distribution",
      options: [
        { value: "peripheral", label: "Peripheral / eccentric / wedge-shaped / small", diseases: ["MS"] },
        { value: "central", label: "Central / symmetric, >50% area, white and grey matter destroyed", diseases: ["NMOSD"] },
        { value: "grey-h", label: "Central / symmetric, confined to grey matter (H sign), white matter spared", diseases: ["MOGAD"] },
      ],
    },
    {
      id: "spinal-tropism",
      title: "Anatomical tropism",
      options: [
        { value: "cervical", label: "Upper spine / cervical cord", diseases: ["MS"] },
        { value: "cervical-thoracic", label: "Cervical / upper thoracic", diseases: ["NMOSD"] },
        { value: "thoraco-conus", label: "Thoraco-lumbar / conus medullaris", diseases: ["MOGAD"] },
      ],
    },
    {
      id: "spinal-cavitation",
      title: "Cavitation / atrophy, intense enhancement, bright spotty lesion",
      options: [
        { value: "present", label: "Present", diseases: ["NMOSD"] },
        { value: "absent", label: "Absent", diseases: ["MS", "MOGAD"] },
      ],
    },
  ],
  optic: [
    {
      id: "optic-length",
      title: "Length",
      options: [
        { value: "short", label: "Short segment (<50%)", diseases: ["MS"] },
        { value: "long", label: "Long segment (≥50%)", diseases: ["NMOSD", "MOGAD"] },
      ],
    },
    {
      id: "optic-tropism",
      title: "Anatomical tropism",
      options: [
        { value: "retrobulbar", label: "Retrobulbar", diseases: ["MS"] },
        { value: "posterior", label: "Posterior nerve / optic chiasma / optic tract", diseases: ["NMOSD"] },
        { value: "anterior", label: "Anterior nerve", diseases: ["MOGAD"] },
      ],
    },
    {
      id: "optic-perineuritis",
      title: "Perineuritis",
      options: [
        { value: "absent", label: "Absent", diseases: ["MS", "NMOSD"] },
        { value: "present", label: "Present", diseases: ["MOGAD"] },
      ],
    },
    {
      id: "optic-laterality",
      title: "Laterality",
      options: [
        { value: "unilateral", label: "Strongly unilateral during acute attacks", diseases: ["MS"] },
        { value: "bilateral-seq", label: "Bilateral sequential", diseases: ["NMOSD"] },
        { value: "bilateral-sim", label: "Bilateral simultaneous", diseases: ["NMOSD", "MOGAD"] },
      ],
    },
  ],
  brain: [
    {
      id: "brain-pattern",
      title: "Lesion pattern",
      options: [
        { value: "plaques", label: "Focal plaques", diseases: ["MS"] },
        { value: "necrosis", label: "Necrosis / cavitation", diseases: ["NMOSD"] },
        { value: "fluffy", label: "Fluffy poorly demarcated lesion", diseases: ["MOGAD"] },
      ],
    },
    {
      id: "brain-distribution",
      title: "Distribution",
      options: [
        { value: "ms", label: "Dawson's fingers • periventricular / juxtacortical / cortical", diseases: ["MS"] },
        { value: "nmosd", label: "Periependymal • area postrema • diencephalon", diseases: ["NMOSD"] },
        { value: "mogad", label: "Subcortical white matter • brainstem", diseases: ["MOGAD"] },
      ],
    },
  ],
};
