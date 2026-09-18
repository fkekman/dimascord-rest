import { Injectable } from '@nestjs/common';

export interface DefaultEntry {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class InMemoryRepository<T extends DefaultEntry> {
  private entries: T[] = [];

  async find(params: Partial<T>): Promise<T[]> {
    const keys = Object.keys(params) as (keyof T)[];

    if (keys.length === 0) return this.entries;

    return this.entries.filter((u) =>
      keys.every((key) => u[key] === params[key]),
    );
  }

  async findOne(params: Partial<T>): Promise<T | null> {
    const keys = Object.keys(params) as (keyof T)[];

    if (keys.length === 0) return null;

    return (
      this.entries.find((e) => keys.every((key) => e[key] === params[key])) ??
      null
    );
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const entry: T = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),

      ...data,
    } as T;

    this.entries.push(entry);
    return entry;
  }

  async update(
    id: string,
    data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<T | null> {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index === -1) return null;

    const updatedEntry: T = {
      ...this.entries[index],
      ...data,
      id,
      createdAt: this.entries[index].createdAt,
      updatedAt: new Date(),
    };

    this.entries[index] = updatedEntry;
    return updatedEntry;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index === -1) return false;

    this.entries.splice(index, 1);
    return true;
  }
}
