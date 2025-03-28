import { LinkData } from '../data/data';

export default function LinkList() {
    const data = LinkData;
    return (
        <div id='links-list'>

                {data.map((item)=>{
                    return(
                            <li>
                                <a href={item.link} target='_blank'>
                                    <img src={item.icon} className='link-icon' loading='lazy'/>
                                </a>
                                <div className="link-gradient"></div>
                                <div className="link-border"></div>
                            </li>
                    )
                })}

        </div>);
}