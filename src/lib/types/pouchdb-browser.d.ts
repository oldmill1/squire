declare global {
  interface Window {
    PouchDB: any;
    pouchDBInstance: any;
  }
}

declare module 'pouchdb-browser' {
  interface Database {
    put(doc: any): Promise<any>;
    get(id: string): Promise<any>;
    remove(id: string, rev: string): Promise<any>;
    allDocs(options?: { include_docs?: boolean }): Promise<{ rows: any[] }>;
    changes(options?: { live?: boolean; include_docs?: boolean }): any;
    info(): Promise<any>;
  }

  interface PouchDBStatic {
    new(name: string): Database;
  }

  const PouchDB: PouchDBStatic;
  export = PouchDB;
}
