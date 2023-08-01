import express, { Application } from 'express';
import api from './api';

export default function configure(app: Application) {
  app.use(express.json()).use('/api', api());
}
