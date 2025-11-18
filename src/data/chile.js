// src/data/chile.js

export const REGIONES = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana de Santiago",
  "Libertador General Bernardo O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén del General Carlos Ibáñez del Campo",
  "Magallanes y de la Antártica Chilena",
]

// Comunas representativas por región (funciona ya).
// Si quieres TODAS las comunas, completa cada arreglo siguiendo este mismo formato.
export const COMUNAS_POR_REGION = {
  "Arica y Parinacota": [
    "Arica", "Camarones", "Putre", "General Lagos"
  ],
  "Tarapacá": [
    "Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"
  ],
  "Antofagasta": [
    "Antofagasta", "Mejillones", "Sierra Gorda", "Taltal",
    "Calama", "Ollagüe", "San Pedro de Atacama",
    "Tocopilla", "María Elena"
  ],
  "Atacama": [
    "Copiapó", "Caldera", "Tierra Amarilla",
    "Chañaral", "Diego de Almagro",
    "Vallenar", "Alto del Carmen", "Freirina", "Huasco"
  ],
  "Coquimbo": [
    "La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña",
    "Illapel", "Canela", "Los Vilos", "Salamanca",
    "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"
  ],
  "Valparaíso": [
    "Valparaíso", "Viña del Mar", "Concón",
    "Quilpué", "Villa Alemana", "Limache", "Olmué",
    "Quillota", "La Calera", "Hijuelas", "La Cruz", "Nogales",
    "San Antonio", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo",
    "Casablanca", "Quintero", "Puchuncaví", "Papudo", "Zapallar", "La Ligua", "Petorca", "Cabildo", "Isla de Pascua", "Juan Fernández"
  ],
  "Metropolitana de Santiago": [
    "Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba",
    "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes",
    "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén",
    "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín",
    "San Miguel", "San Ramón", "Vitacura",
    "Puente Alto", "San José de Maipo", "Pirque",
    "Colina", "Lampa", "Tiltil",
    "Buin", "Paine", "San Bernardo", "Calera de Tango",
    "Melipilla", "María Pinto", "Curacaví", "Alhué", "San Pedro",
    "Talagante", "Peñaflor", "Isla de Maipo", "El Monte", "Padre Hurtado"
  ],
  "Libertador General Bernardo O'Higgins": [
    "Rancagua", "Machalí", "Graneros", "Mostazal", "Codegua", "Doñihue", "Coltauco", "Coínco",
    "Rengo", "Requínoa", "Malloa", "San Vicente",
    "San Fernando", "Chimbarongo", "Nancagua", "Placilla", "Santa Cruz", "Palmilla", "Peralillo", "Lolol", "Pumanque"
  ],
  "Maule": [
    "Talca", "San Clemente", "Maule", "Pelarco", "Pencahue", "Río Claro", "Curepto", "Constitución",
    "Curicó", "Teno", "Romeral", "Molina", "Sagrada Familia", "Hualañé", "Licantén", "Vichuquén",
    "Linares", "Colbún", "Yerbas Buenas", "Villa Alegre", "Longaví", "Retiro", "Parral", "San Javier"
  ],
  "Ñuble": [
    "Chillán", "Chillán Viejo", "Bulnes", "Quillón", "San Ignacio", "El Carmen",
    "Yungay", "Pemuco", "Ñiquén", "San Carlos", "Coihueco", "San Fabián", "Coelemu", "Ránquil", "Trehuaco", "Cobquecura", "Ninhue", "Portezuelo", "Quirihue"
  ],
  "Biobío": [
    "Concepción", "Talcahuano", "Hualpén", "San Pedro de la Paz", "Chiguayante", "Penco", "Tomé",
    "Coronel", "Lota", "Hualqui", "Florida",
    "Los Ángeles", "Cabrero", "Yumbel", "Nacimiento", "Laja", "San Rosendo", "Mulchén", "Quilleco",
    "Santa Bárbara", "Quilaco", "Antuco", "Tucapel", "Alto Biobío", "Arauco", "Lebu", "Cañete", "Contulmo", "Tirúa", "Curanilahue"
  ],
  "La Araucanía": [
    "Temuco", "Padre Las Casas", "Nueva Imperial", "Carahue", "Saavedra", "Cholchol", "Cunco", "Melipeuco", "Vilcún", "Curarrehue", "Pucón",
    "Villarrica", "Gorbea", "Loncoche", "Toltén", "Pitrufquén", "Freire", "Galvarino", "Lautaro", "Perquenco"
  ],
  "Los Ríos": [
    "Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli",
    "La Unión", "Río Bueno", "Futrono", "Lago Ranco"
  ],
  "Los Lagos": [
    "Puerto Montt", "Puerto Varas", "Llanquihue", "Frutillar", "Maullín", "Calbuco",
    "Osorno", "Purranque", "Río Negro", "San Pablo", "Puerto Octay",
    "Castro", "Ancud", "Quellón", "Dalcahue", "Curaco de Vélez", "Chonchi", "Queilén", "Quinchao",
    "Hualaihué", "Chaitén", "Futaleufú", "Palena"
  ],
  "Aysén del General Carlos Ibáñez del Campo": [
    "Coyhaique", "Aysén", "Lago Verde", "Guaitecas", "Cisnes", "Chile Chico", "Río Ibáñez", "Cochrane", "O'Higgins", "Tortel"
  ],
  "Magallanes y de la Antártica Chilena": [
    "Punta Arenas", "Natales", "Porvenir", "Primavera", "Timaukel", "Cabo de Hornos", "Antártica"
  ],
}
