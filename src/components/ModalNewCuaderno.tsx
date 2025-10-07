import {Modal, Button, Form} from 'react-bootstrap';
import { useState } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { CuadernoType } from '../types';
import {useNavigate} from 'react-router-dom';

import { useDispatch } from 'react-redux'
import { addToast } from '../parametersSlice';

const ModalNewCuaderno = ({show, handleClose}: {show:boolean, handleClose:()=>void}) => {
    const axiosPrivate = useAxiosPrivate();
    const dispatch = useDispatch();
    const [cuaderno, setCuaderno] = useState<CuadernoType>({
        UUID: '',
        Nombre: '',
        Owner: {
            UUID: '',
            Nombre: '',
            Sobrenombre: '',
            Activo: true,
            Image: null
        },
        AnioINPC: null,
        DateBorn: new Date(),
        Publico: true
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(cuaderno.Nombre.trim()===''){
            dispatch(addToast({texto: 'El nombre es obligatorio'}));
            return;
        }
        try {
            const response = await axiosPrivate.post('/Cuadernos', cuaderno);
            const data = response?.data;
            
            handleClose();
            setCuaderno({
                UUID: '',
                Nombre: '',
                Owner: {
                    UUID: '',
                    Nombre: '',
                    Sobrenombre: '',
                    Activo: true,
                    Image: null
                },
                AnioINPC: null,
                DateBorn: new Date(),
                Publico: true
            });

            navigate(`/cuadernos/${data.UUID}`);
        } catch (err) {
            setError('Error al crear el cuaderno');
        }
    }

    return(
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Nuevo cuaderno</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <div className='alert alert-danger'>{error}</div>}
                    <Form.Group className="mb-3" controlId="formNombre">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" placeholder="Ingrese el nombre del cuaderno" value={cuaderno.Nombre} onChange={(e) => setCuaderno({...cuaderno, Nombre: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formDescripcion">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="Ingrese una descripción (opcional)" value={cuaderno.Descripcion} onChange={(e) => setCuaderno({...cuaderno, Descripcion: e.target.value})} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Visibilidad del cuaderno</Form.Label>
                        <Form.Check type="switch" checked={cuaderno.Publico} label={cuaderno.Publico ? "Cuaderno público" : "Cuaderno privado"} onChange={(e) => setCuaderno({...cuaderno, Publico: e.target.checked})}/>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" type="submit">
                        Crear
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}
export default ModalNewCuaderno;