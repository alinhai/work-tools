import { useRef, useState, useEffect, useMemo } from 'react';
import { Button, Col, Dropdown, Form, Image, Row, Select, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, DownOutlined, DownloadOutlined } from '@ant-design/icons'
import { saveAs } from "file-saver";
import {
    Document,
    HorizontalPositionAlign,
    HorizontalPositionRelativeFrom,
    ImageRun,
    Packer,
    Paragraph,
    VerticalAlign,
    VerticalPositionAlign,
    VerticalPositionRelativeFrom
} from "docx";
import './index.css';


const PAGE_SIZE = {
    A3: {
        width: 29.7,
        height: 42.02,
    },
    A4: {
        width: 20.99,
        height: 29.7,
    },
    A5: {
        width: 14.82,
        height: 20.99,
    },
}
const pageSize = Object.keys(PAGE_SIZE).map(v => ({ label: v, value: v }));
const FONT_SIZE = [12, 24, 36, 48, 64];
const fontSize = FONT_SIZE.map(v => ({ label: v, value: v }))
const pixelRatio = 10;
const menuKeys = {
    EXPORT_ALL: 'Export All',
    EXPORT_SELECTED: 'Export Selected',
};

const NameCard = () => {
    const [list, setList] = useState([]);
    const [selectedKeys, setSelectKeys] = useState([]);
    const [form] = Form.useForm<{
        fontSize: number,
        pageSize: string
    }>();
    const fontSizeValue = Form.useWatch('fontSize', form) || fontSize[2].value;
    const pageSizeValue = Form.useWatch('pageSize', form) || pageSize[1].value;
    const namesValue = Form.useWatch('names', form) || [];
    const img = useMemo(() => PAGE_SIZE[pageSizeValue], [pageSizeValue])
    const canvasRef = useRef<HTMLCanvasElement>();
    const menus = useMemo(() => ([
        {
            disabled: !list.length,
            label: menuKeys.EXPORT_ALL,
            key: menuKeys.EXPORT_ALL
        },
        { 
            disabled: !selectedKeys.length,
            label: menuKeys.EXPORT_SELECTED,
            key: menuKeys.EXPORT_SELECTED
        },
    ]), [list, selectedKeys]);

    const generateImg = (name) => {
        const fontSize = fontSizeValue * pixelRatio;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // @ts-ignore
        ctx.reset();

        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `bold ${fontSize}px serif`;
        ctx.fillStyle = '#000';

        const { width: w } = ctx.measureText(name);
        const maxWidth = canvas.width;
        const width = w >= canvas.width ? maxWidth : w;
        const x = (canvas.width - width) / 2;
        const y = canvas.height / 2;
        ctx.fillText(name, x, y + fontSize + 10, maxWidth);
        const gap = 20 * pixelRatio;
        ctx.translate(canvas.width, canvas.height - fontSize * 2 - gap);
        ctx.rotate(Math.PI);
        ctx.fillText(name, x, y - fontSize, maxWidth);

        return {
            name,
            src: canvas.toDataURL(),
        };
    }

    const generateDocx = (arr) => {
        const { width, height } = img;
        const ratio = 30 ;
        const sections = [];
        const properties = {
            verticalAlign: VerticalAlign.TOP,
            page: {
                size: {
                    width: `${width}cm`,
                    height: `${height}cm`,
                }
            }
        };
        arr.forEach(({ src }) => {
            const data = src.split('base64,')[1];
            sections.push(
                {
                    properties,
                    children: [
                        new Paragraph({
                        children: [
                            new ImageRun({
                            data: Uint8Array.from(atob(data), c => c.charCodeAt(0)),
                            transformation: {
                                width: width * ratio,
                                height: height * ratio,
                            },
                            floating: {
                                horizontalPosition: {
                                    relative: HorizontalPositionRelativeFrom.PAGE,
                                    align: HorizontalPositionAlign.CENTER,
                                },
                                verticalPosition: {
                                    relative: VerticalPositionRelativeFrom.PAGE,
                                    align: VerticalPositionAlign.CENTER,
                                },
                            },
                            })
                        ]
                        })
                    ]
                },
                {
                    properties,
                    children: [],
                }
            );
        });
        const doc = new Document({ sections });
    
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, `NameCard_${Date.now()}.docx`);
        })
    }

    const onChange = (nameList) => {
        setList(nameList.map(generateImg))
    }

    const onImgClick = (item) => {
        const link = document.createElement('a');
        link.href = item.src;
        link.download = `${item.name}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    const onDowaload = (arr) => {
        arr.forEach(onImgClick);
    }

    const onSelect = (key) => {
        const arr = selectedKeys.slice();
        const index = arr.indexOf(key);
        if (index !== -1) {
            arr.splice(index, 1);
        } else {
            arr.push(key);
        }
        setSelectKeys(arr);
    }

    const onMenuClick = (callback, menu) => {
        const arr = (
            menu.key === menuKeys.EXPORT_ALL
                ? list
                : list.filter(({ name }) => selectedKeys.includes(name))
        );
        callback(arr);
    }

    useEffect(() => {
        onChange(namesValue)
    }, [fontSizeValue, pageSizeValue, namesValue])

    return (
        <>
            <Form form={form}>
                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item label="Font Size" name='fontSize'>
                            <Select
                                options={fontSize}
                                defaultValue={fontSizeValue}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Page Size" name='pageSize'>
                            <Select
                                options={pageSize}
                                defaultValue={pageSizeValue}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item>
                            <Dropdown
                                menu={{
                                    items: menus,
                                    onClick: onMenuClick.bind(null, onDowaload),
                                }}
                            >
                                <Button type='primary'>
                                    <Space>
                                        Export Image
                                        <DownOutlined />
                                    </Space>
                                </Button>
                            </Dropdown>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item>
                            <Dropdown
                                menu={{
                                    items: menus,
                                    onClick: onMenuClick.bind(null, generateDocx),
                                }}
                            >
                                <Button type='primary'>
                                    <Space>
                                        Export Docs
                                        <DownOutlined />
                                    </Space>
                                </Button>
                            </Dropdown>
                            {/* <Button
                                type='primary'
                                onClick={generateDocx}
                                disabled={!list.length}
                            >导出Word文档</Button> */}
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="names">
                            <Select
                                className='name-select'
                                mode="tags"
                                open={false}
                                allowClear
                                style={{ width: '100%' }}
                                placeholder="请输入名字，按回车键确认"
                                tokenSeparators={[',', ' ', '，']}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            <Row gutter={16}>
                {list.map(item => {
                    const isSelected = selectedKeys.includes(item.name);
                    const onSelectClick = onSelect.bind(null, item.name);

                    return (
                        <Col>
                            <Image
                                className={`name-img${isSelected ? ' img-selected' : ''}`}
                                width={img.width * pixelRatio}
                                height={img.height * pixelRatio}
                                src={item.src}
                                alt={item.name}
                                preview={{
                                    visible: false,
                                    mask: (
                                        <>
                                            <div onClick={onImgClick.bind(null, item)}>
                                                <DownloadOutlined />
                                                Download
                                            </div><br />
                                            {isSelected
                                                ? (
                                                    <div onClick={onSelectClick}>
                                                        <CloseCircleOutlined />
                                                        Unselect
                                                    </div>
                                                ) : (
                                                    <div onClick={onSelectClick}>
                                                        <CheckCircleOutlined />
                                                        Select
                                                    </div>
                                                )
                                            }
                                        </>
                                    ),
                                }}
                            />
                        </Col>
                    )
                })}
            </Row>
            <canvas
                ref={ref => (canvasRef.current = ref)}
                width={img.width * pixelRatio * pixelRatio}
                height={img.height * pixelRatio * pixelRatio}
                style={{ display: 'none' }}
            ></canvas>
        </>
    )
}

export default NameCard