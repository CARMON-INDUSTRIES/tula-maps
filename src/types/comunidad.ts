export interface Obra {
  id: number;
  obraAccionPrograma: string;
  tipoIntervencion: string;
  localidadUbicacion: string;
  montoInversion?: string;
  estatus: string;
  anio?: number;
  direccion: string;
}

export interface Comunidad {
  id: number;
  nombre: string;
  descripcion?: string | null;
  obras: Obra[];
}