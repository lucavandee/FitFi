export async function fetchData(userId: string, type: string): Promise<any> {
  return null;
}

export async function saveData(userId: string, type: string, data: any): Promise<void> {
  console.log('Saving data for user:', userId, type);
}

export default { fetchData, saveData };
