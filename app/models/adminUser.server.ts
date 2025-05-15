import { ObjectId } from "mongodb";
import { getCollection } from "~/utils/db.server";
import * as bcrypt from "bcryptjs";

export interface AdminUser {
  _id?: ObjectId;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Crear un usuario admin con contraseña hasheada
export async function createAdminUser(username: string, password: string): Promise<AdminUser> {
  try {
    const adminUsers = await getCollection<AdminUser>("adminuser");
    
    // Verificar si ya existe un usuario admin
    const existingUser = await adminUsers.findOne({});
    if (existingUser) {
      throw new Error("Ya existe un usuario administrador. Solo puede haber un usuario admin en el sistema.");
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const adminUser: AdminUser = {
      username,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await adminUsers.insertOne(adminUser);
    if (!result.acknowledged) {
      throw new Error("No se pudo crear el usuario administrador");
    }
    
    return adminUser;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw new Error(`Error al crear usuario admin: ${error instanceof Error ? error.message : "Error desconocido"}`);
  }
}

// Obtener el usuario admin
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const adminUsers = await getCollection<AdminUser>("adminuser");
    return adminUsers.findOne({});
  } catch (error) {
    console.error("Error getting admin user:", error);
    throw new Error("No se pudo obtener el usuario administrador");
  }
}

// Actualizar el nombre de usuario
export async function updateAdminUsername(newUsername: string): Promise<boolean> {
  try {
    const adminUsers = await getCollection<AdminUser>("adminuser");
    const adminUser = await adminUsers.findOne({});
    
    if (!adminUser) {
      throw new Error("No existe un usuario administrador");
    }
    
    const result = await adminUsers.updateOne(
      { _id: adminUser._id },
      { 
        $set: { 
          username: newUsername,
          updatedAt: new Date()
        } 
      }
    );
    
    return result.acknowledged && result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating admin username:", error);
    throw new Error(`Error al actualizar el nombre de usuario: ${error instanceof Error ? error.message : "Error desconocido"}`);
  }
}

// Actualizar la contraseña
export async function updateAdminPassword(newPassword: string): Promise<boolean> {
  try {
    const adminUsers = await getCollection<AdminUser>("adminuser");
    const adminUser = await adminUsers.findOne({});
    
    if (!adminUser) {
      throw new Error("No existe un usuario administrador");
    }
    
    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await adminUsers.updateOne(
      { _id: adminUser._id },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );
    
    return result.acknowledged && result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating admin password:", error);
    throw new Error(`Error al actualizar la contraseña: ${error instanceof Error ? error.message : "Error desconocido"}`);
  }
}

// Verificar credenciales de usuario
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  try {
    const adminUsers = await getCollection<AdminUser>("adminuser");
    const adminUser = await adminUsers.findOne({ username });
    
    if (!adminUser) {
      return false;
    }
    
    return bcrypt.compare(password, adminUser.password);
  } catch (error) {
    console.error("Error verifying admin credentials:", error);
    throw new Error("Error al verificar las credenciales de administrador");
  }
}

// Inicializar usuario admin si no existe (usado en la primera ejecución)
export async function initializeDefaultAdminUser(): Promise<boolean> {
  try {
    const adminUsers = await getCollection<AdminUser>("adminuser");
    const existingAdmin = await adminUsers.findOne({});
    
    if (existingAdmin) {
      // Ya existe un admin, no hacer nada
      return false;
    }
    
    // Crear admin por defecto
    await createAdminUser("olga", "olga");
    console.log("Usuario administrador inicializado con valores por defecto");
    return true;
  } catch (error) {
    console.error("Error initializing default admin user:", error);
    return false;
  }
} 