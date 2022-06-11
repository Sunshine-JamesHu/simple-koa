const AUTH_METADATA = 'Metadata:Auth';

export function Auth() {
  return (target: Function) => {
    Reflect.defineMetadata(AUTH_METADATA, {}, target);
  };
}


