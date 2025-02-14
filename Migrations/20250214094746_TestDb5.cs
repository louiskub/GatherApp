using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GatherApp.Migrations
{
    /// <inheritdoc />
    public partial class TestDb5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Locations",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Posts");

            migrationBuilder.RenameColumn(
                name: "Locations",
                table: "Activities",
                newName: "GoogleMapLink");

            migrationBuilder.AddColumn<bool>(
                name: "IsOpened",
                table: "Posts",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "District",
                table: "Activities",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "Online",
                table: "Activities",
                type: "tinyint(1)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Province",
                table: "Activities",
                type: "varchar(200)",
                maxLength: 200,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOpened",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "District",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Online",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Province",
                table: "Activities");

            migrationBuilder.RenameColumn(
                name: "GoogleMapLink",
                table: "Activities",
                newName: "Locations");

            migrationBuilder.AddColumn<string>(
                name: "Locations",
                table: "Posts",
                type: "varchar(200)",
                maxLength: 200,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Posts",
                type: "varchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
