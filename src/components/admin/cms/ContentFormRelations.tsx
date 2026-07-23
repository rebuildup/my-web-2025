import { Trash2 } from "lucide-react";
import { contentFormStyles as s } from "./ContentForm.styles";
import type { ContentFormSectionProps } from "./ContentForm.types";

export function ContentFormRelations({
	formData,
	setFormData,
}: ContentFormSectionProps) {
	return (
		<div style={s.col2}>
			{(formData.relations || []).map((relation, index) => (
				<div
					key={`${relation.targetId}-${relation.type}`}
					style={{
						display: "flex",
						gap: 8,
						alignItems: "center",
						marginBottom: 6,
					}}
				>
					<input
						style={{ ...s.input, flex: 2 }}
						value={relation.targetId || ""}
						placeholder="ターゲットID"
						onChange={(event) => {
							const relations = [...(formData.relations || [])];
							relations[index] = {
								...relations[index],
								targetId: event.target.value,
							};
							setFormData((prev) => ({ ...prev, relations }));
						}}
					/>
					<input
						style={{ ...s.input, flex: 1 }}
						value={relation.type || ""}
						placeholder="種類"
						onChange={(event) => {
							const relations = [...(formData.relations || [])];
							relations[index] = {
								...relations[index],
								type: event.target.value,
							};
							setFormData((prev) => ({ ...prev, relations }));
						}}
					/>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							gap: 4,
							fontSize: 12,
							width: 140,
						}}
					>
						<input
							type="checkbox"
							checked={relation.bidirectional || false}
							onChange={(event) => {
								const relations = [...(formData.relations || [])];
								relations[index] = {
									...relations[index],
									bidirectional: event.target.checked,
								};
								setFormData((prev) => ({ ...prev, relations }));
							}}
						/>
						双方向
					</label>
					<button
						type="button"
						style={s.btnDanger}
						onClick={() =>
							setFormData((prev) => ({
								...prev,
								relations: (prev.relations || []).filter(
									(_, itemIndex) => itemIndex !== index,
								),
							}))
						}
						aria-label="リレーションを削除"
					>
						<Trash2 size={16} />
					</button>
				</div>
			))}
			<button
				type="button"
				style={s.btn}
				onClick={() =>
					setFormData((prev) => ({
						...prev,
						relations: [
							...(prev.relations || []),
							{ targetId: "", type: "related", bidirectional: false },
						],
					}))
				}
			>
				リレーションを追加
			</button>
		</div>
	);
}
