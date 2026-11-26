import { inject, provide, ref, type Ref, type InjectionKey } from "vue";
export type TemperatureUnit = "C" | "F";
export const convertTemperature = (c: number, unit: TemperatureUnit) =>
  unit === "F" ? (c * 9) / 5 + 32 : c;
export const toCelsius = (value: number, unit: TemperatureUnit) =>
  unit === "F" ? ((value - 32) * 5) / 9 : value;
function createUnits(unit: Ref<TemperatureUnit>) {
  return {
    unit,
    label: () => `°${unit.value}`,
    value: (c: number) => convertTemperature(c, unit.value).toFixed(1),
    temperature: (c: number) =>
      `${convertTemperature(c, unit.value).toFixed(1)} °${unit.value}`,
    delta: (c: number) =>
      `${(unit.value === "F" ? c * 1.8 : c).toFixed(1)} °${unit.value}`,
  };
}
type Units = ReturnType<typeof createUnits>;
const key: InjectionKey<Units> = Symbol("lab-temperature-units");
export function provideTemperatureUnits() {
  const units = createUnits(ref<TemperatureUnit>("C"));
  provide(key, units);
  return units;
}
export function useTemperatureUnits() {
  return inject(key, () => createUnits(ref<TemperatureUnit>("C")), true);
}
