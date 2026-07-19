export interface ZeltoRule {
    id?: string,
    keyword?: string,
    reason?: string,
    action?: string,
    targets?: string[],
    vindex?: number,
}