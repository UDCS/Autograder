export const parseDateString = (dateString: string) => {
    let parts = dateString.split("-").map((p, i) => Number(p) - Number(i == 1));
    return new Date(parts[0], parts[1], parts[2]);
}