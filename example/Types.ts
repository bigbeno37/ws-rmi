export interface Server {
    add(x: number, y: number): Promise<number>;
}