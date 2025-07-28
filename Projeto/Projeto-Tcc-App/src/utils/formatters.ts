export function formatBytes(bytes: number | undefined | null): string {
  // Retorna N/A para valores inválidos
  if (bytes === undefined || bytes === null || Number.isNaN(bytes)) return 'N/A';
  if (bytes === 0) return '0 B';
  
  // Converte para número positivo
  const absoluteBytes = Math.abs(bytes);
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  
  // Calcula o índice da unidade apropriada
  const i = absoluteBytes === 0 ? 0 : Math.floor(Math.log(absoluteBytes) / Math.log(k));
  
  // Formata o número com 2 casas decimais
  const value = absoluteBytes / Math.pow(k, i);
  return `${value.toFixed(2)} ${sizes[i]}`;
}
