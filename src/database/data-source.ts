import { DataSource } from 'typeorm';
import { loadConfiguration } from '../configuration';
import { databaseOptions } from './database.options';

export default new DataSource(databaseOptions(loadConfiguration()));
