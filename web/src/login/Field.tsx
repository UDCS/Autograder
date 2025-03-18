export function Field(type: string, placeholder: string, update: Function){
    return (
        <input type={type} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {update(e.target.value)}} placeholder={placeholder}>
        </input>
    );
}