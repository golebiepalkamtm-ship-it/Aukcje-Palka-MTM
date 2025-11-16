import { parseAchievementData } from './parser';

const RAW_ACHIEVEMENTS_DATA = `2001
Oddział Lubań
Kat A: Mistrz, 235.77 coeff, 20 con
Kat B: I Wicemistrz, 503.62 coeff, 16 con
Kat GMO: Mistrz, - coeff, - con
Okręg Jelenia Góra
Kat A: I Wicemistrz, 235.77 coeff, 20 con
Kat B: IX Przodownik, 503.62 coeff, 16 con
Kat GMO: I Wicemistrz, - coeff, - con
2002
Oddział Lubań
Kat A: Mistrz, 501.52 coeff, 20 con
Kat GMO: II Wicemistrz, 40 coeff, - con
Okręg Jelenia Góra
Kat A: Mistrz, 501.52 coeff, 20 con
Kat GMO: Mistrz, 40 coeff, - con
Region V
Kat A: 50 Przodownik, 501.52 coeff, 20 con
Kat B: II Przodownik, 168.11 coeff, 16 con
2003
Oddział Lubań
Kat A: Mistrz, 203.54 coeff, 20 con
Kat B: Mistrz, 217.78 coeff, 16 con
Kat C: Mistrz, 71.99 coeff, 9 con
Kat GMO: Mistrz, 462.22 coeff, - con
Okręg Jelenia Góra
Kat A: Mistrz, 203.54 coeff, 20 con
Kat B: I Wicemistrz, 217.78 coeff, 16 con
Kat C: Mistrz, 71.99 coeff, 9 con
Kat GMO: VI Przodownik, 462.22 coeff, - con
Region V
Kat A: 10 Przodownik, 203.54 coeff, 20 con
Kat B: 49 Przodownik, 217.78 coeff, 16 con
Kat C: 2 Miejsce, 971.99 coeff, - con
Kat D: II Przodownik, - coeff, - con
Kat GMP: 11 Przodownik, 1066.26 coeff, - con
MP
Kat C: 13 Przodownik, 71.99 coeff, 9 con
Kat GMP: 28 Przodownik, 1066.26 coeff, - con
2004
Oddział Lubań
Kat A: Mistrz, 180.91 coeff, 20 con
Kat B: Mistrz, 196.07 coeff, 16 con
Kat GMO: I Wicemistrz, - coeff, - con
Okręg Jelenia Góra
Kat A: Mistrz, 180.91 coeff, 20 con
Kat B: I Przodownik, 196.07 coeff, 16 con
Kat GMO: I Przodownik, - coeff, - con
Region V
Kat A: 18 Przodownik, 180.91 coeff, 20 con
Kat D: 35 Przodownik, 839.32 coeff, - con
MP
Kat A: 32 Przodownik, 180.91 coeff, 20 con
2005
Oddział Lubań
Kat A: Mistrz, 90.65 coeff, 20 con
Kat B: Mistrz, 66.96 coeff, 16 con
Kat GMO: I Wicemistrz, - coeff, - con
Okręg Jelenia Góra
Kat A: Mistrz, 90.65 coeff, 20 con
Kat B: Mistrz, 66.96 coeff, 16 con
Kat GMO: I Przodownik, - coeff, - con
Region V
Kat A: II Wicemistrz, 90.65 coeff, 20 con
MP
Kat A: I Przodownik, 90.65 coeff, 20 con
Kat B: V Przodownik, 66.96 coeff, 16 con
2006
Oddział Lubań
Kat A: Mistrz, 240.15 coeff, 20 con
Kat B: Mistrz, 183.25 coeff, 16 con
Kat GMO: Mistrz, 82.77 coeff, 15 con
Okręg Jelenia Góra
Kat A: Mistrz, 199.28 coeff, 20 con
Kat B: II Przodownik, 367.51 coeff, 16 con
Kat GMO: I Wicemistrz, 82.77 coeff, 15 con
Region V
Kat A: 18 Przodownik, 240.15 coeff, 20 con
Kat B: 24 Przodownik, 183.25 coeff, 16 con
Kat GMO: 3 Przodownik, 82.77 coeff, 15 con
MP
Kat GMO: VI Przodownik, 82.77 coeff, 15 con
2007
Oddział Lubań
Kat A: Mistrz, 78.06 coeff, 20 con
Kat GMO: II Wicemistrz, - coeff, - con
Okręg Jelenia Góra
Kat A: Mistrz, 78.06 coeff, 20 con
Region V
Kat A: II Przodownik, 78.06 coeff, 20 con
MP
Kat A: I Przodownik, 78.06 coeff, 20 con
2008
Oddział Lubań 092
Kat A: Mistrz, 49.88 coeff, 20 con
Kat B: Mistrz, 158.27 coeff, 16 con
Kat GMP: I Wicemistrz, 49.88 coeff, - con
Okręg Jelenia Góra
Kat A: Mistrz, 49.88 coeff, 20 con
Kat B: II Wicemistrz, 158.27 coeff, 16 con
Kat GMP: I Wicemistrz, 49.88 coeff, - con
Region V
Kat A: Mistrz, 49.88 coeff, 20 con
Kat B: XX Przodownik, 158.27 coeff, 16 con
Kat GMP: I Wicemistrz, 49.88 coeff, - con
Kat GMP: 20 Przodownik, 158.27 coeff, - con
MP
Kat A: 3 Przodownik, 49.88 coeff, 20 con
2009
Oddział Łużyce Lubań 0446
Kat A: MISTRZ*, 82.33 coeff, 20 con
Kat B: MISTRZ*, 81.43 coeff, 16 con
Kat C: II/III V-ce MISTRZ*, 348.08 coeff, 9 con
Kat M: I V-ce MISTRZ*, 130.47 coeff, 6 con
Kat Młode: I V-ce MISTRZ*, 160.61 coeff, 15 con
Okręg Jelenia Góra
Kat A: MISTRZ, 82.33 coeff, 20 con
Kat B: MISTRZ, 81.43 coeff, 16 con
Kat C: 16. Przodownik, 348.08 coeff, 9 con
Kat M: 1. Przodownik, 130.47 coeff, 6 con
Kat Młode: I V-ce MISTRZ, 160.61 coeff, 15 con
Generalne: I V-ce MISTRZ, 1401.99 coeff, 32 con
2010
Oddział Łużyce Lubań 0446
Kat A: I V-ce MISTRZ*, 293.79 coeff, 20 con
Kat B: MISTRZ*, 62.47 coeff, 16 con
Kat H: I V-ce MISTRZ*, 975.71 coeff, 18 con
Kat Młode: MISTRZ*, 245.86 coeff, 15 con
Kat Roczne: MISTRZ*, 1692.16 coeff, 34 con
Okręg Jelenia Góra
Kat A: I V-ce MISTRZ, 293.79 coeff, 20 con
Kat B: MISTRZ, 62.47 coeff, 16 con
Kat H: II V-ce MISTRZ, 975.71 coeff, 18 con
Kat Młode: MISTRZ, 245.86 coeff, 15 con
Kat Roczne: 1. Przodownik, 1692.16 coeff, 34 con
2011
Oddział Łużyce Lubań 0446
Kat Total dorosłych: Mistrz, 611.73 coeff, 70 con
Kat A: Mistrz, 161.32 coeff, 20 con
Kat B: Mistrz, 51.32 coeff, 16 con
Kat C: Mistrz, 84.07 coeff, 9 con
Kat M: Mistrz, 59.36 coeff, 6 con
Kat D: Mistrz, 296.71 coeff, - con
Kat H: Mistrz, 588.92 coeff, 18 con
Kat Roczne: Mistrz, 534.49 coeff, 20 con
Okręg Jelenia Góra
Kat A: I V-ce MISTRZ, 161.32 coeff, 20 con
Kat B: MISTRZ, 51.32 coeff, 16 con
Kat C: MISTRZ, 84.07 coeff, 9 con
Kat D: MISTRZ, 296.71 coeff, 45 con
Kat E: II V-ce MISTRZ, 81.60 coeff, 6 con
Kat F: I V-ce MISTRZ, 243.05 coeff, 15 con
Kat G: 1. Przodownik, 1583.79 coeff, 34 con
Kat H: II V-ce MISTRZ, 588.92 coeff, 18 con
Generalne: I V-ce MISTRZ, 1417.76 coeff, 32 con
Region V
Kat A: 3 Przodownik, 161.32 coeff, 20 con
Kat B: Mistrz, 51.32 coeff, 16 con
2012
Oddział Łużyce Lubań 0446
Kat A: I Mistrz, 575.76 coeff, 20 con
Kat B: I Mistrz, 160.25 coeff, 16 con
Kat C: II Wicemistrz, 119.72 coeff, 9 con
Kat M Maraton: I Mistrz, 103.06 coeff, - con
Kat D: I Mistrz, 855.28 coeff, - con
Kat GMO: I Mistrz, 1409.58 coeff, - con
Kat H: I Mistrz, 887.54 coeff, - con
Kat Roczne: I Mistrz, 413.58 coeff, 20 con
Kat Olimpijskie: I Mistrz, 646.45 coeff, - con
Kat Total dorośli: I Mistrz, 1080.51 coeff, - con
Kat Total młodzi: II Wicemistrz, 150.62 coeff, - con
MP
Kat Maraton: 8 Przodownik, 648.45 coeff, - con
Kat Olimpijskie: 68 Przodownik, 847.37 coeff, - con
2013
Oddział Łużyce Lubań 0446
Kat A: Mistrz, 66.43 coeff, 20 con
Kat B: Mistrz, 87.62 coeff, 16 con
Kat C: 1 Przodownik, 525.46 coeff, 9 con
Kat D: Mistrz, 679.51 coeff, 45 con
Kat GMO: II Wicemistrz, 1373.93 coeff, 32 con
Kat H: Mistrz, 338.68 coeff, 18 con
Kat Roczne: 3 Przodownik, 1025.61 coeff, 28 con
Kat Total młodzi: I Wicemistrz, 562.03 coeff, 25 con
Kat 5 najlepszych młodzi: Mistrz, 1139.02 coeff, 21 con
Okręg Jelenia Góra
Kat A: Mistrz, - coeff, 20 con
Kat B: Mistrz, - coeff, 16 con
Kat H: Mistrz, - coeff, 18 con
Kat Roczne: I Wicemistrz, - coeff, 20 con
Region V
Kat A: I Wicemistrz, - coeff, 20 con
Kat B: 1 Przodownik, - coeff, 16 con
Kat Roczne: 1 Przodownik, - coeff, 20 con
Kat D: 3 Przodownik, - coeff, 45 con
Kat GMP: 68 Przodownik, 1381.43 coeff, - con
MP
Kat A: II Wicemistrz, 66.43 coeff, 20 con
Kat B: 13 Przodownik, 685.69 coeff, 16 con
Kat Roczne: 9 Przodownik, 227.84 coeff, 20 con
2014
Oddział Łużyce Lubań 0446
Kat A: I Mistrz, 116.13 coeff, 20 con
Kat B: I Mistrz, 661.38 coeff, 16 con
Kat C: 5 Przodownik, 362.76 coeff, 9 con
Kat D: I Mistrz, 557.24 coeff, - con
Kat H: I Mistrz, 577.48 coeff, - con
Kat Roczne: I Mistrz, 239.29 coeff, 20 con
Kat Lotniki: 2 Przodownik, 524.88 coeff, - con
Okręg Jelenia Góra
Kat A: I Mistrz, 116.13 coeff, 20 con
Kat B: I Mistrz, 661.38 coeff, 16 con
Region V
Kat A: Mistrz, 116.13 coeff, 20 con
Kat B: Mistrz, 661.38 coeff, 16 con
MP
Kat A: Mistrz, 116.13 coeff, 20 con
Kat B: Mistrz, 661.38 coeff, 16 con
Kat Klasa Sport A: 22 Miejsce, - coeff, 20 con
2015
Oddział Łużyce Lubań 0446
Kat A: I Mistrz, 86.77 coeff, 20 con
Kat B: I Mistrz, 237.95 coeff, 16 con
Kat C: I Mistrz, 199.65 coeff, 9 con
Kat D: I Mistrz, 520.82 coeff, 45 con
Okręg Jelenia Góra
Kat A: Mistrz, 86.77 coeff, 20 con
Region V
Kat A: Mistrz, 86.77 coeff, 20 con
MP
Kat A: Mistrz, 86.77 coeff, 20 con
Kat B: 1 Przodownik, 71.68 coeff, 16 con
2017
Oddział Kwisa 0489
Kat A: 1 Przodownik, 348.53 coeff, 20 con
Kat B: 1 Przodownik, 153.39 coeff, 16 con
2018
Oddział Kwisa 0489
Kat A: Mistrz, 29.38 coeff, 18 con
Kat B: Mistrz, 35.74 coeff, 15 con
Kat Total: XIII Przodownik, 942.69 coeff, 43 con
Kat Młode 5 gołębi: 57 miejsce, 239.98 pkt, 1018.135 coeff, 5 con
Kat Młode Główna: 59 miejsce, 109.32 pkt, 15.4 knk/km, 4 con
2019
Oddział Kwisa 0489
Kat A: Mistrz, 82.76 coeff, - con
Kat B: Mistrz, 130.64 coeff, - con
Kat Młode GMP: 1 miejsce, 931.51 pkt, - con
Kat Młode Derby: 7 miejsce, 591.85 pkt, 2752.677 coeff, - con
Kat Młode 5 gołębi: 1 miejsce, 181.10 pkt, 2807.786 coeff, - con
Kat Młode Total: 1 miejsce, 109.88 pkt, 73.7% coeff, - con
2020
Oddział Kwisa 0489
Kat A: Mistrz, 69.22 coeff, 18 con
Kat B: Mistrz, 82.03 coeff, 15 con
Kat C: Mistrz, 561.95 coeff, 9 con
Kat D: Mistrz, 713.20 coeff, 42 con
Okręg Jelenia Góra
Kat A: 3 Przodownik, 69.22 coeff, 18 con
Kat B: I V-ce Mistrz, 81.30 coeff, 15 con
Kat C: 2 Przodownik, 561.95 coeff, 9 con
Kat D: Mistrz, 713.20 coeff, 42 con
Region V
Kat A: I V-ce Mistrz, 63.82 coeff, 18 con
Kat B: I V-ce Mistrz, 70.75 coeff, 15 con
Kat C: 12 Przodownik, 561.95 coeff, 9 con
Kat D: 7 Przodownik, 713.20 coeff, 42 con
MP
Kat A: I V-ce Mistrz, 63.82 coeff, 18 con
Kat B: I V-ce Mistrz, 70.75 coeff, 15 con
Kat C: ~70 Przodownik, 561.95 coeff, 9 con
Kat D: ~50 Przodownik, 713.20 coeff, 42 con
2023
Oddział Kwisa 0489
Kat A: MISTRZ Pałka MTM, 184.75 coeff, 18 con
Kat B: I V-ce MISTRZ Pałka MTM, 286.13 coeff, 15 con
2024
Oddział Kwisa 0489
Kat A: MISTRZ Pałka MTM, 124.53 coeff, 18 con
Kat B: MISTRZ Pałka MTM, 245.78 coeff, 15 con`;

export const achievementsData = parseAchievementData(RAW_ACHIEVEMENTS_DATA);

