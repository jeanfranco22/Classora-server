import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Esta entidad guarda las respuestas automáticas del chatbot
// El admin puede crear, editar y desactivar FAQs desde el panel
@Entity({ name: 'chatbot_faqs' })
export class ChatbotFAQ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Palabras clave que activan esta respuesta (separadas por comas)
  // Ejemplo: "horario,horarios,hora,cuando abren"
  // El bot busca si alguna de estas palabras aparece en el mensaje del usuario
  @Column({ type: 'text', nullable: false })
  keywords: string;

  // La respuesta automática que el bot enviará
  // Puede incluir saltos de línea, emojis, etc.
  @Column({ type: 'text', nullable: false })
  response: string;

  // Prioridad: si múltiples FAQs matchean, se usa la de mayor prioridad
  // Útil para respuestas más específicas vs más generales
  // Ejemplo: prioridad 10 para "precio premium", prioridad 5 para "precio"
  @Column({ type: 'int', default: 0 })
  priority: number;

  // Si la FAQ está activa (false = no se usa aunque haga match)
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Categoría para organizar las FAQs en el panel admin
  // Ejemplo: "Precios", "Horarios", "Clases", "Membresías"
  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;
}
