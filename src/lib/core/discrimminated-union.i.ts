type DUI1<T extends Array<[string, unknown]>> = {
  [K in keyof T]: {
    __kind: T[K][0];
    value: T[K][1];
  };
};
type DU2<T extends DUI1<X>, X extends Array<[string, unknown]>> = T[number];
type DU<T extends Array<[string, unknown]>> = DU2<DUI1<T>, T>;

export type { DU };
