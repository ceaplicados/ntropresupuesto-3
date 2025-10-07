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
                        { cuaderno.Owner.Image ? (<img src={cuaderno.Owner.Image} className="owner-img" alt={cuaderno.Owner.Sobrenombre}  title={cuaderno.Owner.Sobrenombre}/>) : null}
                        <ul className='users-imgs'>
                        { 
                        cuaderno.Usuarios ? 
                            cuaderno.Usuarios.map((usuario) => {
                                return (<li key={usuario.UUID}>
                                { usuario.Image ? (<img src={usuario.Image} className="owner-img" alt={usuario.Sobrenombre} title={usuario.Sobrenombre} />) : null }
                                </li>)
                            }) : null
                        }
                        </ul>
                    </div>
                    <Link to={'/cuaderno/'+cuaderno.UUID}>
                        <Button variant='primary'>Ir</Button>
                    </Link>
                </Card.Footer>
        </Card>
    )
}
export default CuadernoFicha;