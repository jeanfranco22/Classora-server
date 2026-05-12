import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatbotFAQ } from './entities/chatbot-faq.entity';
import { Class } from '../class/class.entity';
import { User } from 'src/users/users.entity';

@Injectable()
export class ChatbotService {
  constructor(
    @InjectRepository(ChatbotFAQ)
    private readonly faqRepository: Repository<ChatbotFAQ>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  // Busca si el mensaje del usuario matchea con alguna FAQ configurada
  // Devuelve la respuesta automática o null si no hay match
  async getAutomaticResponse(userMessage: string): Promise<string | null> {
    // Convertimos el mensaje a minúsculas para hacer búsqueda case-insensitive
    const normalizedMessage = userMessage.toLowerCase().trim();

    // Traemos todas las FAQs activas, ordenadas por prioridad (mayor primero)
    const faqs = await this.faqRepository.find({
      where: { isActive: true },
      order: { priority: 'DESC' },
    });

    // Buscamos la primera FAQ cuyas keywords estén en el mensaje del usuario
    for (const faq of faqs) {
      // Separamos las keywords por comas y quitamos espacios
      const keywords = faq.keywords
        .split(',')
        .map((k) => k.trim().toLowerCase());

      // Si alguna keyword aparece en el mensaje, devolvemos la respuesta
      const hasMatch = keywords.some((keyword) =>
        normalizedMessage.includes(keyword),
      );

      if (hasMatch) {
        return faq.response;
      }
    }

    // No hubo match con ninguna FAQ
    return null;
  }

  // ─── SUGERENCIAS DE CLASES SEGÚN PERFIL ──────────────────────────────────

  // Sugiere clases al usuario basándose en su perfil o historial
  // Por ahora es simple: sugiere las clases activas con más capacidad disponible
  // Puedes mejorarlo después con preferencias del usuario, historial, etc.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async suggestClasses(user: User): Promise<string> {
    // Traemos las clases activas con mayor capacidad
    const classes = await this.classRepository.find({
      where: { isActive: true },
      order: { capacity: 'DESC' },
      take: 3, // Solo las top 3
    });

    if (classes.length === 0) {
      return 'No hay clases disponibles en este momento.';
    }

    // Construimos un mensaje amigable con las sugerencias
    let response = '🏋️ Clases que podrían interesarte:\n\n';
    classes.forEach((cls, index) => {
      response += `${index + 1}. **${cls.name}**\n`;
      response += `   Duración: ${cls.duration}\n`;
      response += `   ${cls.description}\n\n`;
    });

    response += 'Para reservar, habla con tu coach asignado 😊';
    return response;
  }

  // ─── DETECTAR INTENCIÓN DEL MENSAJE ──────────────────────────────────────

  // Analiza si el usuario está pidiendo sugerencias de clases
  // Esto es un método simple basado en keywords, no es IA real
  shouldSuggestClasses(message: string): boolean {
    const normalizedMessage = message.toLowerCase();
    const classKeywords = [
      'clase',
      'clases',
      'recomienda',
      'sugerir',
      'qué clase',
      'actividad',
      'entrenar',
      'ejercicio',
    ];

    return classKeywords.some((keyword) => normalizedMessage.includes(keyword));
  }

  // ─── GESTIÓN DE FAQs (ADMIN) ─────────────────────────────────────────────

  async createFAQ(data: any): Promise<ChatbotFAQ> {
    const faq = this.faqRepository.create(data as ChatbotFAQ);
    return this.faqRepository.save(faq);
  }

  async findAllFAQs(): Promise<ChatbotFAQ[]> {
    return this.faqRepository.find({
      order: {
        category: 'ASC',
        priority: 'DESC',
      },
    });
  }

  async updateFAQ(id: string, data: any): Promise<ChatbotFAQ> {
    await this.faqRepository.update(id, data as ChatbotFAQ);
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new Error(`FAQ with id ${id} not found`);
    }
    return faq;
  }

  async deleteFAQ(id: string): Promise<void> {
    await this.faqRepository.delete(id);
  }
}
