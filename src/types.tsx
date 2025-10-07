export interface UserType {
    UUID: string;
    Nombre: string;
    Apellidos?: string;
    Sobrenombre: string;
    Email?: string;
    Estado?: number;
    Activo: boolean;
    Image: string|null;
}

export interface CuadernoType {
    UUID: string;
    Nombre: string;
    Descripcion?: string;
    Owner: UserType;
    DateBorn: Date;
    Publico: boolean;
    AnioINPC: number|null;
    Anios?: number[];
    Renglones?: RenglonCuadernoType[];
    Usuarios?: UserType[];
}

export interface RenglonCuadernoType {
    Id: number;
    Tipo: string;
    Estado: number;
    IdRefencia?: number;
    TipoFiltro?: string;
    IdFiltro?: number;
    Graph: boolean;
    Mostrar: boolean;
    Data: any;
}