import ("../components/styles/list.css");

const List = ({ listTitles }) => {
    return (
        <div className="list">
            {
                listTitles.map((clustor) => (
                    <div className="list-title" key={clustor.address}>
                        <a className="link-to-cluster" href={`/clustors/${clustor.address}/`}><h3>{ clustor.cname }</h3></a>
                    </div>
                ))
            } 
        </div>
    );
};

export default List;
