type IconProps = {
    type: string;
};

const Icon = ({ type }: IconProps) => {
    return (<span className="material-symbols-outlined">{type}</span>)
}
export default Icon;