import * as dotenv from 'dotenv';
import mongoose, { ConnectOptions } from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Document from './DocumentSchema';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: ['http://localhost:3000'], methods: ['GET', 'POST'] },
});
dotenv.config();

const databaseUrl = process.env.DATABASE as string;

const DB = databaseUrl.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD as string
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions)
  .then(() => {
    console.log('Database connected');
  })
  .catch((error) => {
    console.error('db error', error);
    process.exit(1);
  });

const defaultValue = '';

io.on('connection', (socket) => {
  socket.on('get-document', async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);

    socket.emit('load-document', document?.data);

    socket.on('send-changes', (content) => {
      socket.broadcast.to(documentId).emit('receive-changes', content);
    });

    socket.on('save-document', async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

const findOrCreateDocument = async (id: string) => {
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
};

httpServer.listen(7000, () => {
  console.log('Listening on http://localhost:7000');
});
