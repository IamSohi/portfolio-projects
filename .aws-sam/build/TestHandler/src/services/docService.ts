import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { Document } from '../types';

export class DocumentService {
  private docTable: string;
  private dynamoDB: DynamoDBClient;

  constructor() {
    this.docTable = process.env.DOCUMENT_TABLE!;
    this.dynamoDB = new DynamoDBClient({});
  }

  async createDocument(doc: Partial<Document>): Promise<Document> {
    const timestamp = new Date().toISOString();
    const document: Document = {
      id: `doc_${Date.now()}`,
      title: doc.title || 'Untitled',
      content: doc.content || '',
      ownerId: doc.ownerId!,
      collaborators: doc.collaborators || [],
      lastModified: new Date(timestamp),
      version: 1
    };

    await this.dynamoDB.send(new PutItemCommand({
      TableName: this.docTable,
      Item: {
        id: { S: document.id },
        title: { S: document.title },
        content: { S: document.content },
        ownerId: { S: document.ownerId },
        collaborators: { L: document.collaborators.map((collaborator) => ({ S: collaborator })) },
        lastModified: { S: document.lastModified.toISOString() },
        version: { N: document.version.toString() }
      }
    }));

    return document;
  }

  async getDocument(docId: string, userId: string): Promise<Document> {
    const result = await this.dynamoDB.send(new GetItemCommand({
      TableName: this.docTable,
      Key: { id: { S: docId } }
    }));

    if (!result.Item) {
        throw new Error('Document not found');
    }

    const doc: Document = {
        id: result.Item.id?.S || '',
        title: result.Item.title?.S || '',
        content: result.Item.content?.S || '',
        ownerId: result.Item.ownerId?.S || '',
        collaborators: (result.Item.collaborators?.L?.map((collaborator) => collaborator.S) || []) as string[],
        lastModified: new Date(result.Item.lastModified?.S || ''),
        version: parseInt(result.Item.version?.N || '0')
    };

    if (doc.ownerId !== userId && !doc.collaborators.includes(userId)) {
        throw new Error('Unauthorized access to document');
    }

    return doc;
  }

  async updateDocument(docId: string, userId: string, updates: Partial<Document>): Promise<Document> {
    const doc = await this.getDocument(docId, userId);
    
    const updatedDoc = {
      ...doc,
      ...updates,
      lastModified: new Date(),
      version: doc.version + 1
    };

    await this.dynamoDB.send(new PutItemCommand({
      TableName: this.docTable,
      Item: {
        id: { S: updatedDoc.id },
        title: { S: updatedDoc.title },
        content: { S: updatedDoc.content },
        ownerId: { S: updatedDoc.ownerId },
        collaborators: { L: updatedDoc.collaborators.map((collaborator) => ({ S: collaborator })) },
        lastModified: { S: updatedDoc.lastModified.toISOString() },
        version: { N: updatedDoc.version.toString() }
      }
    }));

    return updatedDoc;
  }
}