import "./TitleBanner.css"

interface TitleBannerProps  {
    children: React.ReactNode;
    src?: string;
};
function TitleBanner({children, src="/public/banner_images/banner_1.png"}: TitleBannerProps) {
    return (
        <div className="titleBanner">
            <img className="bannerImage" src={src}/>
            <div className="title">{children}</div>
        </div>
    );
}
export default TitleBanner;