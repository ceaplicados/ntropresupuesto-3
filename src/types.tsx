export interface UserType {
    Id: number;
    Nombre: string;
    Sobrenombre: string;
    UUID: string;
    Image: string;
}
export interface CuadernoType {
    Id: number;
    Nombre: string;
    Descripcion?: string;
    Owner: UserType;
    Usuarios: UserType[];
}