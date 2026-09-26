// Outlines of the eight BLEU NUIT letters, in the photo's pixels (1600 x 1200).
// The lettering is drawn as paths, not text. The photo's letters are hand-cut angular blocks
// (chamfered corners, flat-bottomed U, slanted stems) that no font provides, so each letter
// outline was traced from reference/signage-bleu-nuit.png and simplified to a few vertices.
// Coordinates below are in the photo's own pixels (1600 x 1200); the block is centred on the
// canvas at load. Each letter is [outline, ...counters].
export const BLEU_NUIT_LETTERS = [
  // BLEU
  [[[145,91],[416,102],[501,196],[434,299],[517,384],[441,558],[141,551]],[[285,208],[283,318],[324,318],[325,212]],[[284,377],[283,478],[324,478],[325,380]]], // B
  [[[528,108],[641,115],[667,440],[782,449],[780,567],[520,560]]], // L
  [[[798,124],[1041,140],[1029,253],[915,273],[918,288],[1021,293],[1021,407],[926,411],[925,456],[1055,456],[1052,573],[790,565]]], // E
  [[[1064,131],[1169,138],[1204,462],[1240,462],[1242,139],[1373,143],[1375,467],[1317,579],[1122,576],[1102,548],[1056,465],[1057,133]]], // U
  // NUIT
  [[[145,570],[241,573],[346,721],[419,577],[531,580],[532,1028],[404,1026],[315,891],[280,1028],[144,1026]]], // N
  [[[576,580],[697,585],[733,899],[759,899],[760,586],[900,589],[903,905],[833,1026],[643,1026],[617,993],[571,910]]], // U
  [[[932,590],[1049,593],[1087,1027],[930,1025]]], // I
  [[[1069,591],[1383,599],[1378,736],[1291,738],[1303,1026],[1147,1023],[1150,736],[1067,732]]] // T
];
