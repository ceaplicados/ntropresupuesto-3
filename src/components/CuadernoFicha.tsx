import { Link } from 'react-router-dom';
import type { CuadernoType } from '../types';
import { Card, Button } from 'react-bootstrap';

const CuadernoFicha = ({ cuaderno }: { cuaderno: CuadernoType }) => {
    return(
        <Card>
            <Card.Body>
                <Card.Title>{cuaderno.Nombre}</Card.Title>
                <Card.Text>
                    {cuaderno.Descripcion ? cuaderno.Descripcion : ''}
                </Card.Text>
            </Card.Body>
            <Card.Footer className='d-flex justify-content-between'>
                    <div className='users'>
                        <img src={cuaderno.Owner.Image} className="owner-img" alt={cuaderno.Owner.Sobrenombre}  title={cuaderno.Owner.Sobrenombre}/>
                        <ul className='users-imgs'>
                        { 
                        cuaderno.Usuarios.map((usuario) => {
                            return (<li key={usuario.UUID}>
                            <img src={usuario.Image} className="owner-img" alt={usuario.Sobrenombre} title={usuario.Sobrenombre} />
                            </li>)
                        }) 
                        }
                        </ul>
                    </div>
                    <Link to={'/cuaderno/'+cuaderno.Id}>
                        <Button variant='primary'>Ir</Button>
                    </Link>
                </Card.Footer>
        </Card>
    )
}
export default CuadernoFicha;