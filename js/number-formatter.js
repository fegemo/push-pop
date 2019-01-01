// adpted from MDN: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Math/round
// function decimalAdjust(value, exp) {
//   // if the exp is undefined or zero...
//   if (typeof exp === "undefined" || +exp === 0) {
//     return Math.round(value);
//   }
//   value = +value;
//   exp = +exp;
//
//   // if the value is not a number or the exp is not an integer...
//   if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
//     return NaN;
//   }
//
//   // shift
//   value = value.toString().split("e");
//   value = Math.round(+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
//   // shift back
//   value = value.toString().split("e");
//   return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
// }

export const roundTo = (number, places) => {
  const characters = number.toString().length;
  if (characters > places) {
    return number.toPrecision(places);
  }
  return number;
};
