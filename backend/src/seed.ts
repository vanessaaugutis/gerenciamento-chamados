import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import { AppDataSource } from './data-source';
import { Category } from './entities/CategorieEntity';
import { Ticket, TicketPriority, TicketStatus } from './entities/TicketEntity';
import { User } from './entities/UserEntity';

async function seed() {
  await AppDataSource.initialize();

  const categoryRepository = AppDataSource.getRepository(Category);
  const userRepository = AppDataSource.getRepository(User);
  const ticketRepository = AppDataSource.getRepository(Ticket);

  const existingCategories = await categoryRepository.count();
  if (existingCategories === 0) {
    await categoryRepository.save([
      categoryRepository.create({
        name: 'Suporte Técnico',
        description: 'Problemas de sistema e acesso',
      }),
      categoryRepository.create({
        name: 'Financeiro',
        description: 'Cobranças e pagamentos',
      }),
      categoryRepository.create({
        name: 'Infraestrutura',
        description: 'Servidores e redes',
      }),
    ]);
  }

  const existingUsers = await userRepository.count();
  if (existingUsers === 0) {
    const passwordHash = await bcrypt.hash('123456', 10);
    await userRepository.save([
      userRepository.create({
        name: 'Admin',
        email: 'admin@empresa.com',
        password: passwordHash,
      }),
      userRepository.create({
        name: 'Maria Silva',
        email: 'maria@empresa.com',
        password: passwordHash,
      }),
      userRepository.create({
        name: 'João Pereira',
        email: 'joao@empresa.com',
        password: passwordHash,
      }),
    ]);
  }

  const existingTickets = await ticketRepository.count();
  if (existingTickets === 0) {
    const categories = await categoryRepository.find();
    const users = await userRepository.find();

    const requester = users[0];
    const responsible = users[1];

    await ticketRepository.save([
      ticketRepository.create({
        subject: 'Erro ao acessar o sistema',
        description:
          'O usuário não consegue realizar login após a atualização.',
        priority: TicketPriority.ALTA,
        status: TicketStatus.ABERTO,
        category: categories[0],
        requester,
        responsible,
      }),
      ticketRepository.create({
        subject: 'Solicitação de reembolso',
        description: 'Preciso de um novo reembolso referente à fatura do mês.',
        priority: TicketPriority.MEDIA,
        status: TicketStatus.EM_ATENDIMENTO,
        category: categories[1],
        requester: users[2],
        responsible,
      }),
      ticketRepository.create({
        subject: 'Servidor indisponível',
        description:
          'O ambiente de homologação ficou indisponível por mais de 30 minutos.',
        priority: TicketPriority.CRITICA,
        status: TicketStatus.AGUARDANDO_USUARIO,
        category: categories[2],
        requester,
        responsible: users[2],
      }),
    ]);
  }

  console.log('Seed executado com sucesso.');
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Erro ao executar seed:', error);
  process.exit(1);
});
