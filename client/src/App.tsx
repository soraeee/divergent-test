import { useState, useEffect } from 'react';
import { Form, Button, Input, Radio, message } from 'antd';
import './App.css'
import './reset.css'

function App() {

	const [form] = Form.useForm();
	const [messageApi, contextHolder] = message.useMessage();

	interface Zone {
		label: 			number;
		shelves: 		Shelf[];
	}

	interface Shelf {
		name:		string;
	}

	type FormResponse = {
		key:	any,
		value:	string;
	}

	const [curZone, setCurZone] = useState<number>(1); // Currently selected zone
	const [zones, setZones] = useState<Zone[]>([]); // Array containing all zones and their shelves
	const [numShelves, setNumShelves] = useState<number>(0); // Number of shelves in the currently selected zone

	const submitZone = (values: FormResponse) => {
		let zoneArr: Zone[] = zones;
		let shelvesArr: Shelf[] = [];

		// Set up duplicate name validation 
		let noDupes = true;
		const shelfNames = new Map();
		for (let i = 0; i < 12; i++) {
			if (i != curZone-1) { // Don't add current zone's values to the map, if they were previously entered
				zoneArr[i].shelves.forEach((shelf: Shelf) => {
					shelfNames.set(shelf.name, true);
				});
			}
		};

		// Add shelves from the form response to the zone
		for (const shelfname of Object.values(values)) {
			if (shelfNames.get(shelfname)) { // Duplicate name check
				noDupes = false;
			} else {
				shelfNames.set(shelfname, true);
			}
			shelvesArr.push({
				name:	shelfname
			});
		};

		// Save the zone and its shelves to client state
		if (noDupes) {
			zoneArr[curZone-1] = {
				label:		curZone,
				shelves:	shelvesArr,
			};
			setZones(zoneArr);
			messageApi.success('Zone ' + curZone + ' successfully saved.');	
		} else {
			messageApi.error('Duplicate shelf names are not allowed!');	
		}
	}

	// Fully reset the form and zones state
	const resetZones = () => {
		let zoneArr: Zone[] = [];
		for (let i = 0; i < 12; i++) {
			zoneArr.push({
				label:		i+1,
				shelves: 	[],
			});
		}
		setZones(zoneArr);
		setNumShelves(0);
		setCurZone(1);
		
		let zoneObj = {
			0: "",
			1: "",
			2: "",
			3: "",
			4: "",
			5: "",
			6: "",
			7: "",
			8: "",
			9: "",
		};
		form.setFieldsValue(zoneObj);
	}

	// Switch what zone is being selected
	const setZoneForm = (e: any) => {
		setCurZone(e.target.value);
		setNumShelves(zones[e.target.value-1].shelves.length);

		// Populate form with existing shelf data
		let zoneObj = {
			0: "",
			1: "",
			2: "",
			3: "",
			4: "",
			5: "",
			6: "",
			7: "",
			8: "",
			9: "",
		};
		for (let i = 0; i < zones[e.target.value-1].shelves.length; i++) {
			zoneObj[i as keyof typeof zoneObj] = zones[e.target.value-1].shelves[i].name;
		};
		form.setFieldsValue(zoneObj);
	}

	const increaseShelves = () => {
		if (numShelves < 10) setNumShelves(numShelves + 1);
	}
	const decreaseShelves = () => {
		if (numShelves > 0) setNumShelves(numShelves - 1);
	}

	// Submit zone data to backend
	const submitWarehouse = () => {
		fetch('http://localhost:3001/api/addwarehouse', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(zones),
			})
			.then(res => {
				if (res.status == 200) {
					messageApi.success('Warehouse data successfully submitted.');	
					resetZones();
				} else {
					messageApi.error('Error occured when submitting data (' + res.status + ')');
				}
			})
		.catch((error) => {
			console.error('Error submitting warehouse:', error);
		});
	}

	useEffect(() => {
		resetZones();
	}, [])

	return (
		<>
			{contextHolder}
			<div className = "main">
				<p>wow it's warehouse software !</p>
				<div className = "flex-h">
					<p>Select zone</p>
					<Radio.Group onChange = {setZoneForm} defaultValue = {1} value = {curZone}>
						<Radio.Button value = {1} key="0">1</Radio.Button>
						{new Array(11).fill('').map((_, index) => (
							<Radio.Button 
								value = {index+2} 
								key = {index+1}
							>
								{index+2}
							</Radio.Button>
						))}
					</Radio.Group>
				</div>
				<div>
					{numShelves < 10 
						? <Button type="primary" onClick = {increaseShelves}>
							Add a shelf
						</Button>
						: <Button type="primary" disabled>
							Add a shelf
						</Button>
					}
					{numShelves > 0 
						? <Button onClick = {decreaseShelves} danger>
							Remove a shelf
						</Button>
						: <Button disabled danger>
							Remove a shelf
						</Button>
					}
				</div>
				{numShelves == 0 
					? <p>No shelves for this zone</p>
					: null}
				<Form
					name = {"zoneForm"}
					onFinish = {submitZone}
					form = {form}
					style={{
						width: '100%',
					}}
				>
					{new Array(numShelves).fill('').map((_, index) => (
						<Form.Item
							name = {index}
							key = {index}
							validateTrigger={['onChange', 'onBlur']}
							rules={[
								{
									required: true,
									whitespace: true,
								},
							]}
							noStyle
						>
							<Input
								placeholder="Shelf name"
								style={{
									width: '30%',
								}}
							/>
						</Form.Item>
					))}

					<Form.Item>
						<Button type="default" htmlType="submit">
						Save shelf
						</Button>
					</Form.Item>
				</Form>
				<Button type="primary" onClick = {submitWarehouse}>
					Submit warehouse
				</Button>
			</div>
		</>
	)
}

export default App
