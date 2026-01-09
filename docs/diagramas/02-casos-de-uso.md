# Diagrama de Casos de Uso

## Descripción
Este diagrama muestra los principales casos de uso del sistema Request App desde la perspectiva de los usuarios finales.

## Diagrama Mermaid

```mermaid
graph TB
    User((👤 Usuario))
    Guest((👤 Visitante))

    subgraph "Autenticación y Registro"
        UC1[Registrarse]
        UC2[Iniciar Sesión]
        UC3[Cerrar Sesión]
    end

    subgraph "Gestión de Perfil"
        UC4[Ver Perfil Propio]
        UC5[Editar Perfil]
        UC6[Ver Perfil de Otro Usuario]
        UC7[Buscar Usuarios]
    end

    subgraph "Publicaciones"
        UC8[Crear Publicación]
        UC9[Ver Feed de Publicaciones]
        UC10[Filtrar Publicaciones]
        UC11[Eliminar Publicación]
    end

    subgraph "Solicitudes"
        UC12[Crear Solicitud]
        UC13[Ver Solicitudes Recibidas]
        UC14[Ver Solicitudes Enviadas]
        UC15[Aceptar Solicitud]
        UC16[Rechazar Solicitud]
        UC17[Proponer Acuerdo]
        UC18[Aceptar Acuerdo]
        UC19[Completar Solicitud]
    end

    subgraph "Mensajería y Chat"
        UC20[Enviar Mensaje]
        UC21[Ver Conversaciones]
        UC22[Ver Mensajes de Conversación]
        UC23[Chat en Tiempo Real]
        UC24[Marcar Mensaje como Leído]
    end

    subgraph "Calificaciones y Reseñas"
        UC25[Calificar Usuario]
        UC26[Escribir Reseña]
        UC27[Ver Calificaciones Propias]
        UC28[Ver Calificaciones de Otro Usuario]
    end

    subgraph "Notificaciones"
        UC29[Ver Notificaciones]
        UC30[Marcar Notificación como Leída]
        UC31[Recibir Notificaciones en Tiempo Real]
    end

    Guest --> UC1
    Guest --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC10
    User --> UC11
    User --> UC12
    User --> UC13
    User --> UC14
    User --> UC15
    User --> UC16
    User --> UC17
    User --> UC18
    User --> UC19
    User --> UC20
    User --> UC21
    User --> UC22
    User --> UC23
    User --> UC24
    User --> UC25
    User --> UC26
    User --> UC27
    User --> UC28
    User --> UC29
    User --> UC30
    User --> UC31

    UC12 -.->|Genera| UC29
    UC15 -.->|Genera| UC29
    UC20 -.->|Genera| UC29
    UC19 -.->|Permite| UC25
    UC19 -.->|Permite| UC26

    style User fill:#4caf50,color:#fff
    style Guest fill:#ff9800,color:#fff
    style UC1 fill:#e3f2fd
    style UC2 fill:#e3f2fd
    style UC3 fill:#e3f2fd
    style UC4 fill:#f3e5f5
    style UC5 fill:#f3e5f5
    style UC6 fill:#f3e5f5
    style UC7 fill:#f3e5f5
    style UC8 fill:#e8f5e9
    style UC9 fill:#e8f5e9
    style UC10 fill:#e8f5e9
    style UC11 fill:#e8f5e9
    style UC12 fill:#fff3e0
    style UC13 fill:#fff3e0
    style UC14 fill:#fff3e0
    style UC15 fill:#fff3e0
    style UC16 fill:#fff3e0
    style UC17 fill:#fff3e0
    style UC18 fill:#fff3e0
    style UC19 fill:#fff3e0
    style UC20 fill:#e0f2f1
    style UC21 fill:#e0f2f1
    style UC22 fill:#e0f2f1
    style UC23 fill:#e0f2f1
    style UC24 fill:#e0f2f1
    style UC25 fill:#fff9c4
    style UC26 fill:#fff9c4
    style UC27 fill:#fff9c4
    style UC28 fill:#fff9c4
    style UC29 fill:#fce4ec
    style UC30 fill:#fce4ec
    style UC31 fill:#fce4ec
```

## Diagrama PlantUML

```plantuml
@startuml CasosDeUso
!theme plain
skinparam backgroundColor #FFFFFF

left to right direction

actor "Usuario" as User
actor "Visitante" as Guest

rectangle "Autenticación y Registro" {
  usecase "Registrarse" as UC1
  usecase "Iniciar Sesión" as UC2
  usecase "Cerrar Sesión" as UC3
}

rectangle "Gestión de Perfil" {
  usecase "Ver Perfil Propio" as UC4
  usecase "Editar Perfil" as UC5
  usecase "Ver Perfil de Otro Usuario" as UC6
  usecase "Buscar Usuarios" as UC7
}

rectangle "Publicaciones" {
  usecase "Crear Publicación" as UC8
  usecase "Ver Feed de Publicaciones" as UC9
  usecase "Filtrar Publicaciones" as UC10
  usecase "Eliminar Publicación" as UC11
}

rectangle "Solicitudes" {
  usecase "Crear Solicitud" as UC12
  usecase "Ver Solicitudes Recibidas" as UC13
  usecase "Ver Solicitudes Enviadas" as UC14
  usecase "Aceptar Solicitud" as UC15
  usecase "Rechazar Solicitud" as UC16
  usecase "Proponer Acuerdo" as UC17
  usecase "Aceptar Acuerdo" as UC18
  usecase "Completar Solicitud" as UC19
}

rectangle "Mensajería y Chat" {
  usecase "Enviar Mensaje" as UC20
  usecase "Ver Conversaciones" as UC21
  usecase "Ver Mensajes de Conversación" as UC22
  usecase "Chat en Tiempo Real" as UC23
  usecase "Marcar Mensaje como Leído" as UC24
}

rectangle "Calificaciones y Reseñas" {
  usecase "Calificar Usuario" as UC25
  usecase "Escribir Reseña" as UC26
  usecase "Ver Calificaciones Propias" as UC27
  usecase "Ver Calificaciones de Otro Usuario" as UC28
}

rectangle "Notificaciones" {
  usecase "Ver Notificaciones" as UC29
  usecase "Marcar Notificación como Leída" as UC30
  usecase "Recibir Notificaciones en Tiempo Real" as UC31
}

Guest --> UC1
Guest --> UC2
User --> UC3
User --> UC4
User --> UC5
User --> UC6
User --> UC7
User --> UC8
User --> UC9
User --> UC10
User --> UC11
User --> UC12
User --> UC13
User --> UC14
User --> UC15
User --> UC16
User --> UC17
User --> UC18
User --> UC19
User --> UC20
User --> UC21
User --> UC22
User --> UC23
User --> UC24
User --> UC25
User --> UC26
User --> UC27
User --> UC28
User --> UC29
User --> UC30
User --> UC31

UC12 ..> UC29 : <<genera>>
UC15 ..> UC29 : <<genera>>
UC20 ..> UC29 : <<genera>>
UC19 ..> UC25 : <<permite>>
UC19 ..> UC26 : <<permite>>

@enduml
```

## Descripción de Casos de Uso Principales

### Autenticación y Registro
- **Registrarse**: Un visitante puede crear una cuenta nueva
- **Iniciar Sesión**: Usuario autenticado puede acceder al sistema
- **Cerrar Sesión**: Usuario puede cerrar su sesión

### Gestión de Perfil
- **Ver/Editar Perfil**: Usuario puede ver y modificar su información personal
- **Buscar Usuarios**: Buscar otros usuarios por nombre, carrera, habilidades

### Publicaciones
- **Crear/Ver/Eliminar Publicaciones**: Gestión completa del feed de publicaciones
- **Filtrar**: Por tipo (trabajo, proyecto, colaboración) y carrera

### Solicitudes
- **Ciclo completo**: Crear → Aceptar/Rechazar → Proponer Acuerdo → Completar
- **Estados**: PENDING → ACCEPTED → COMPLETED

### Mensajería
- **Chat en tiempo real**: Comunicación instantánea entre usuarios
- **Historial**: Ver conversaciones y mensajes anteriores

### Calificaciones
- **Solo después de completar**: Las calificaciones se dan al completar una solicitud
- **Reseñas**: Comentarios adicionales junto con la calificación

### Notificaciones
- **Tiempo real**: Notificaciones push cuando ocurren eventos relevantes
- **Tipos**: Nuevo mensaje, solicitud recibida, solicitud aceptada, etc.










